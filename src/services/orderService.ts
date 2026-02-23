import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

export const getOrders = async (token: string) => {
  const res = await axios.get(`${API}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
