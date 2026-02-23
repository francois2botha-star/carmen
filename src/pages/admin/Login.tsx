import React, { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import axios from 'axios';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/login`, {
        username,
        password,
      });
      localStorage.setItem('adminToken', res.data.token);
      window.location.href = '/admin/dashboard';
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="text-red-600">{error}</div>}
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
};

export default Login;
