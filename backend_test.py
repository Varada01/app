import requests
import sys
import json
from datetime import datetime

class CreatorFundAPITester:
    def __init__(self, base_url="https://creatorfund-4.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.creator_token = None
        self.investor_token = None
        self.creator_user = None
        self.investor_user = None
        self.test_channel_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_creator_registration(self):
        """Test creator registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "Creator Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": f"creator_{timestamp}@test.com",
                "password": "TestPass123!",
                "name": f"Test Creator {timestamp}",
                "user_type": "creator"
            }
        )
        if success and 'token' in response:
            self.creator_token = response['token']
            self.creator_user = response['user']
            return True
        return False

    def test_investor_registration(self):
        """Test investor registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "Investor Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": f"investor_{timestamp}@test.com",
                "password": "TestPass123!",
                "name": f"Test Investor {timestamp}",
                "user_type": "investor"
            }
        )
        if success and 'token' in response:
            self.investor_token = response['token']
            self.investor_user = response['user']
            return True
        return False

    def test_login(self):
        """Test login functionality"""
        if not self.creator_user:
            return False
            
        success, response = self.run_test(
            "Creator Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.creator_user['email'],
                "password": "TestPass123!"
            }
        )
        return success and 'token' in response

    def test_auth_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            token=self.creator_token
        )
        return success and response.get('id') == self.creator_user['id']

    def test_create_channel(self):
        """Test channel creation"""
        success, response = self.run_test(
            "Create Channel",
            "POST",
            "channels",
            200,
            data={
                "name": "Test Tech Channel",
                "description": "A test channel for tech reviews",
                "category": "Technology",
                "goal_amount": 50000.0,
                "equity_percentage": 20.0,
                "cover_image": None
            },
            token=self.creator_token
        )
        if success and 'id' in response:
            self.test_channel_id = response['id']
            return True
        return False

    def test_get_channels(self):
        """Test getting all channels"""
        success, response = self.run_test(
            "Get All Channels",
            "GET",
            "channels",
            200
        )
        return success and isinstance(response, list)

    def test_get_channel_detail(self):
        """Test getting specific channel details"""
        if not self.test_channel_id:
            return False
            
        success, response = self.run_test(
            "Get Channel Detail",
            "GET",
            f"channels/{self.test_channel_id}",
            200
        )
        return success and response.get('id') == self.test_channel_id

    def test_add_team_member(self):
        """Test adding team member"""
        if not self.test_channel_id or not self.investor_user:
            return False
            
        success, response = self.run_test(
            "Add Team Member",
            "POST",
            f"channels/{self.test_channel_id}/team",
            200,
            data={
                "user_email": self.investor_user['email'],
                "role": "Video Editor",
                "profit_split_percentage": 15.0
            },
            token=self.creator_token
        )
        return success

    def test_get_team_members(self):
        """Test getting team members"""
        if not self.test_channel_id:
            return False
            
        success, response = self.run_test(
            "Get Team Members",
            "GET",
            f"channels/{self.test_channel_id}/team",
            200
        )
        return success and isinstance(response, list)

    def test_investment(self):
        """Test making an investment"""
        if not self.test_channel_id:
            return False
            
        success, response = self.run_test(
            "Make Investment",
            "POST",
            "investments",
            200,
            data={
                "channel_id": self.test_channel_id,
                "amount": 5000.0
            },
            token=self.investor_token
        )
        return success

    def test_get_my_investments(self):
        """Test getting user's investments"""
        success, response = self.run_test(
            "Get My Investments",
            "GET",
            "investments/my",
            200,
            token=self.investor_token
        )
        return success and isinstance(response, list)

    def test_get_channel_investors(self):
        """Test getting channel investors"""
        if not self.test_channel_id:
            return False
            
        success, response = self.run_test(
            "Get Channel Investors",
            "GET",
            f"channels/{self.test_channel_id}/investors",
            200
        )
        return success and isinstance(response, list)

    def test_distribute_profits(self):
        """Test profit distribution"""
        if not self.test_channel_id:
            return False
            
        success, response = self.run_test(
            "Distribute Profits",
            "POST",
            "profits/distribute",
            200,
            data={
                "channel_id": self.test_channel_id,
                "total_profit": 10000.0
            },
            token=self.creator_token
        )
        return success

    def test_get_profit_history(self):
        """Test getting profit history"""
        if not self.test_channel_id:
            return False
            
        success, response = self.run_test(
            "Get Profit History",
            "GET",
            f"profits/{self.test_channel_id}",
            200
        )
        return success and isinstance(response, list)

    def test_get_my_channels(self):
        """Test getting creator's channels"""
        success, response = self.run_test(
            "Get My Channels",
            "GET",
            "channels/my/created",
            200,
            token=self.creator_token
        )
        return success and isinstance(response, list)

    def test_invalid_investment_amount(self):
        """Test investment with amount below minimum"""
        if not self.test_channel_id:
            return False
            
        success, response = self.run_test(
            "Invalid Investment Amount (Below Minimum)",
            "POST",
            "investments",
            400,  # Should fail with 400
            data={
                "channel_id": self.test_channel_id,
                "amount": 100.0  # Below minimum of 500
            },
            token=self.investor_token
        )
        return success

    def test_unauthorized_access(self):
        """Test unauthorized access"""
        success, response = self.run_test(
            "Unauthorized Access",
            "GET",
            "auth/me",
            401  # Should fail with 401
        )
        return success

def main():
    print("🚀 Starting CreatorFund API Tests...")
    print("=" * 50)
    
    tester = CreatorFundAPITester()
    
    # Test sequence
    test_sequence = [
        ("Creator Registration", tester.test_creator_registration),
        ("Investor Registration", tester.test_investor_registration),
        ("Login", tester.test_login),
        ("Get Current User", tester.test_auth_me),
        ("Create Channel", tester.test_create_channel),
        ("Get All Channels", tester.test_get_channels),
        ("Get Channel Detail", tester.test_get_channel_detail),
        ("Add Team Member", tester.test_add_team_member),
        ("Get Team Members", tester.test_get_team_members),
        ("Make Investment", tester.test_investment),
        ("Get My Investments", tester.test_get_my_investments),
        ("Get Channel Investors", tester.test_get_channel_investors),
        ("Distribute Profits", tester.test_distribute_profits),
        ("Get Profit History", tester.test_get_profit_history),
        ("Get My Channels", tester.test_get_my_channels),
        ("Invalid Investment Amount", tester.test_invalid_investment_amount),
        ("Unauthorized Access", tester.test_unauthorized_access),
    ]
    
    # Run all tests
    for test_name, test_func in test_sequence:
        try:
            result = test_func()
            if not result:
                print(f"⚠️  {test_name} failed - continuing with next test")
        except Exception as e:
            print(f"💥 {test_name} crashed: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())