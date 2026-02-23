import axios from 'axios';
import { Product } from '../types/Product';

const API = import.meta.env.VITE_API_BASE_URL;

export const getProducts = async (): Promise<Product[]> => {
  const res = await axios.get(`${API}/products`);
  return res.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const res = await axios.get(`${API}/products/${id}`);
  return res.data;
};

export const createProduct = async (product: Partial<Product>, token: string) => {
  return axios.post(`${API}/admin/products`, product, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateProduct = async (id: number, product: Partial<Product>, token: string) => {
  return axios.put(`${API}/admin/products/${id}`, product, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteProduct = async (id: number, token: string) => {
  return axios.delete(`${API}/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
