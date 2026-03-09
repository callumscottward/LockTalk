from django.test import TestCase
from members.models import Member

class MemberTest(TestCase):
    def test_str_method(self):
        member = Member(firstName="Alice", lastName="Smith")
        self.assertEqual(str(member), "Alice Smith")