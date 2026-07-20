export async function searchProducts(query: string) {
    const res = await fetch(`https://imperium-bikes.onrender.com/api/search/products?q=${query}`);
    return res.json();
}

export async function searchUsers(query: string) {
    const res = await fetch(`https://imperium-bikes.onrender.com/api/search/users?q=${query}`);
    return res.json();
}

export async function searchVideos(query: string) {
    const res = await fetch(`https://imperium-bikes.onrender.com/api/videos/search?query=${query}`);
    return res.json();
}