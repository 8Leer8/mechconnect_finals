import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthApi {
  final String baseUrl = "http://10.0.2.2:8000"; // Android emulator -> localhost

  Future<List<dynamic>> fetchUsers() async {
    final response = await http.get(Uri.parse('$baseUrl/api/accounts/'));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Failed to fetch users");
    }
  }
}
