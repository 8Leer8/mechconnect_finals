import 'package:flutter/material.dart';
import '../api/auth_api.dart';

class TestApiScreen extends StatefulWidget {
  const TestApiScreen({super.key});

  @override
  _TestApiScreenState createState() => _TestApiScreenState();
}

class _TestApiScreenState extends State<TestApiScreen> {
  final api = AuthApi();
  List<dynamic> users = [];

  @override
  void initState() {
    super.initState();
    loadUsers();
  }

  void loadUsers() async {
    final data = await api.fetchUsers();
    setState(() {
      users = data;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Test API")),
      body: ListView.builder(
        itemCount: users.length,
        itemBuilder: (context, index) {
          final user = users[index];
          return ListTile(
            title: Text(user["username"]),
            subtitle: Text("ID: ${user["id"]}"),
          );
        },
      ),
    );
  }
}
