const API_URL = "https://imperium-bikes.onrender.com";

export async function searchProducts(query: string) {
    const res = await fetch(`${API_URL}/api/search/products?q=${query}`);
    return res.json();
}

export async function searchUsers(query: string) {
    const res = await fetch(`${API_URL}/api/search/users?q=${query}`);
    return res.json();
}