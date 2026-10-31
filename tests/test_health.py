from django.test import SimpleTestCase, Client


class HealthCheckTests(SimpleTestCase):
    def test_health_check_returns_200(self):
        client = Client()
        response = client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'ok')
        self.assertEqual(data.get('service'), 'api')
