from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    user_type: str  # 'creator' or 'investor'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    user_type: str
    balance: float
    created_at: str

class ChannelCreate(BaseModel):
    name: str
    description: str
    category: str
    goal_amount: float
    equity_percentage: float
    cover_image: Optional[str] = None

class Channel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    creator_id: str
    creator_name: str
    category: str
    goal_amount: float
    total_raised: float
    equity_percentage: float
    cover_image: Optional[str] = None
    status: str
    created_at: str

class TeamMemberAdd(BaseModel):
    user_email: str
    role: str
    profit_split_percentage: float

class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    channel_id: str
    user_id: str
    user_name: str
    user_email: str
    role: str
    profit_split_percentage: float
    joined_at: str

class InvestmentCreate(BaseModel):
    channel_id: str
    amount: float

class Investment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    channel_id: str
    channel_name: str
    investor_id: str
    investor_name: str
    amount: float
    equity_percentage: float
    investment_date: str

class ProfitDistribute(BaseModel):
    channel_id: str
    total_profit: float

class ProfitDistribution(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    channel_id: str
    channel_name: str
    total_profit: float
    distribution_date: str
    distributions: List[dict]

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "user_type": user_data.user_type,
        "balance": 10000.0,  # Mock starting balance
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user_id})
    return {"token": token, "user": {k: v for k, v in user_doc.items() if k not in ["_id", "password_hash"]}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"]})
    user_data = {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}
    return {"token": token, "user": user_data}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Channel Routes
@api_router.post("/channels", response_model=Channel)
async def create_channel(channel_data: ChannelCreate, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "creator":
        raise HTTPException(status_code=403, detail="Only creators can create channels")
    
    channel_id = str(uuid.uuid4())
    channel_doc = {
        "id": channel_id,
        "name": channel_data.name,
        "description": channel_data.description,
        "creator_id": current_user["id"],
        "creator_name": current_user["name"],
        "category": channel_data.category,
        "goal_amount": channel_data.goal_amount,
        "total_raised": 0.0,
        "equity_percentage": channel_data.equity_percentage,
        "cover_image": channel_data.cover_image,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.channels.insert_one(channel_doc)
    return Channel(**{k: v for k, v in channel_doc.items() if k != "_id"})

@api_router.get("/channels", response_model=List[Channel])
async def get_channels():
    channels = await db.channels.find({}, {"_id": 0}).to_list(1000)
    return channels

@api_router.get("/channels/{channel_id}", response_model=Channel)
async def get_channel(channel_id: str):
    channel = await db.channels.find_one({"id": channel_id}, {"_id": 0})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

@api_router.post("/channels/{channel_id}/team", response_model=TeamMember)
async def add_team_member(channel_id: str, team_data: TeamMemberAdd, current_user: dict = Depends(get_current_user)):
    # Verify channel exists and user is creator
    channel = await db.channels.find_one({"id": channel_id})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    if channel["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only channel creator can add team members")
    
    # Find user by email
    user = await db.users.find_one({"email": team_data.user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a team member
    existing = await db.team_members.find_one({"channel_id": channel_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="User is already a team member")
    
    member_id = str(uuid.uuid4())
    member_doc = {
        "id": member_id,
        "channel_id": channel_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "role": team_data.role,
        "profit_split_percentage": team_data.profit_split_percentage,
        "joined_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.team_members.insert_one(member_doc)
    return TeamMember(**{k: v for k, v in member_doc.items() if k != "_id"})

@api_router.get("/channels/{channel_id}/team", response_model=List[TeamMember])
async def get_team_members(channel_id: str):
    members = await db.team_members.find({"channel_id": channel_id}, {"_id": 0}).to_list(1000)
    return members

# Investment Routes
@api_router.post("/investments", response_model=Investment)
async def create_investment(investment_data: InvestmentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "investor":
        raise HTTPException(status_code=403, detail="Only investors can invest")
    
    # Get channel
    channel = await db.channels.find_one({"id": investment_data.channel_id})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Check minimum investment
    if investment_data.amount < 500:
        raise HTTPException(status_code=400, detail="Minimum investment is ₹500")
    
    # Check user balance
    if current_user["balance"] < investment_data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Calculate equity percentage for this investment
    equity_per_rupee = channel["equity_percentage"] / channel["goal_amount"]
    investment_equity = equity_per_rupee * investment_data.amount
    
    investment_id = str(uuid.uuid4())
    investment_doc = {
        "id": investment_id,
        "channel_id": investment_data.channel_id,
        "channel_name": channel["name"],
        "investor_id": current_user["id"],
        "investor_name": current_user["name"],
        "amount": investment_data.amount,
        "equity_percentage": investment_equity,
        "investment_date": datetime.now(timezone.utc).isoformat()
    }
    
    await db.investments.insert_one(investment_doc)
    
    # Update channel total_raised
    new_total = channel["total_raised"] + investment_data.amount
    await db.channels.update_one(
        {"id": investment_data.channel_id},
        {"$set": {"total_raised": new_total}}
    )
    
    # Update user balance (mock payment)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"balance": current_user["balance"] - investment_data.amount}}
    )
    
    return Investment(**{k: v for k, v in investment_doc.items() if k != "_id"})

@api_router.get("/investments/my", response_model=List[Investment])
async def get_my_investments(current_user: dict = Depends(get_current_user)):
    investments = await db.investments.find({"investor_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return investments

@api_router.get("/channels/{channel_id}/investors", response_model=List[Investment])
async def get_channel_investors(channel_id: str):
    investors = await db.investments.find({"channel_id": channel_id}, {"_id": 0}).to_list(1000)
    return investors

# Profit Distribution Routes
@api_router.post("/profits/distribute", response_model=ProfitDistribution)
async def distribute_profits(profit_data: ProfitDistribute, current_user: dict = Depends(get_current_user)):
    # Verify channel exists and user is creator
    channel = await db.channels.find_one({"id": profit_data.channel_id})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    if channel["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only channel creator can distribute profits")
    
    # Get team members
    team_members = await db.team_members.find({"channel_id": profit_data.channel_id}, {"_id": 0}).to_list(1000)
    
    # Get investors
    investors = await db.investments.find({"channel_id": profit_data.channel_id}, {"_id": 0}).to_list(1000)
    
    # Calculate distributions
    distributions = []
    remaining_profit = profit_data.total_profit
    
    # Team members get their split percentage
    for member in team_members:
        member_share = profit_data.total_profit * (member["profit_split_percentage"] / 100)
        distributions.append({
            "user_id": member["user_id"],
            "user_name": member["user_name"],
            "amount": member_share,
            "type": "team",
            "percentage": member["profit_split_percentage"]
        })
        remaining_profit -= member_share
        
        # Update user balance
        await db.users.update_one(
            {"id": member["user_id"]},
            {"$inc": {"balance": member_share}}
        )
    
    # Calculate total equity held by investors
    total_investor_equity = sum(inv["equity_percentage"] for inv in investors)
    
    # Distribute remaining profit to investors based on equity
    if total_investor_equity > 0:
        for investor in investors:
            investor_share = remaining_profit * (investor["equity_percentage"] / total_investor_equity)
            distributions.append({
                "user_id": investor["investor_id"],
                "user_name": investor["investor_name"],
                "amount": investor_share,
                "type": "investor",
                "percentage": investor["equity_percentage"]
            })
            
            # Update user balance
            await db.users.update_one(
                {"id": investor["investor_id"]},
                {"$inc": {"balance": investor_share}}
            )
    
    # Creator gets remaining (if any)
    creator_remaining = remaining_profit - sum(d["amount"] for d in distributions if d["type"] == "investor")
    if creator_remaining > 0:
        distributions.append({
            "user_id": current_user["id"],
            "user_name": current_user["name"],
            "amount": creator_remaining,
            "type": "creator",
            "percentage": 0
        })
        
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"balance": creator_remaining}}
        )
    
    distribution_id = str(uuid.uuid4())
    distribution_doc = {
        "id": distribution_id,
        "channel_id": profit_data.channel_id,
        "channel_name": channel["name"],
        "total_profit": profit_data.total_profit,
        "distribution_date": datetime.now(timezone.utc).isoformat(),
        "distributions": distributions
    }
    
    await db.profit_distributions.insert_one(distribution_doc)
    
    return ProfitDistribution(**{k: v for k, v in distribution_doc.items() if k != "_id"})

@api_router.get("/profits/{channel_id}", response_model=List[ProfitDistribution])
async def get_profit_history(channel_id: str):
    profits = await db.profit_distributions.find({"channel_id": channel_id}, {"_id": 0}).to_list(1000)
    return profits

@api_router.get("/channels/my/created", response_model=List[Channel])
async def get_my_channels(current_user: dict = Depends(get_current_user)):
    channels = await db.channels.find({"creator_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return channels

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()