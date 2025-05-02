import unittest
from traice.main import utils

class TestUtils(unittest.TestCase):

    def test_is_valid_url_1(self):
        url = 'http://www.example.com'
        return self.assertTrue(utils.is_valid_url(url))

    def test_is_valid_url_2(self):
        url = 'https://www.example.com'
        return self.assertTrue(utils.is_valid_url(url))
    
    def test_is_valid_url_3(self):
        url = 'http://subdomain.example.com'
        return self.assertTrue(utils.is_valid_url(url))
    
    def test_is_valid_url_4(self):
        url = 'https://www.example.com/path/to/page'
        return self.assertTrue(utils.is_valid_url(url))
    
    def test_is_valid_url_5(self):
        url = 'https://www.example.com/page?param1=value1&param2=value2'
        return self.assertTrue(utils.is_valid_url(url))
    
    def test_is_valid_url_6(self):
        url = 'https://www.example.com/page#section1'
        return self.assertTrue(utils.is_valid_url(url))
    
    def test_is_valid_url_7(self):
        url = 'http://127.0.0.1'
        return self.assertTrue(utils.is_valid_url(url))
    
    def test_is_valid_url_8(self):
        url = 'http://127.0.0.1:5000'
        return self.assertTrue(utils.is_valid_url(url))
    
    def test_is_valid_url_9(self):
        url = 'ftp://www.example.com'
        return self.assertFalse(utils.is_valid_url(url))
    
    def test_is_valid_url_10(self):
        url = 'www.example.com'
        return self.assertFalse(utils.is_valid_url(url))

if __name__ == '__main__':
    unittest.main()