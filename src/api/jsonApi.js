import { all } from "axios";
import axiosClient from "./axiosClient";


// ===== gerer les users =====
export function getUsers() {
  return axiosClient.get("/users");
}

// ===== gerer les cities =====
export function getCities() {
  return axiosClient.get("/cities");
}
export function createCity(data) {
  return axiosClient.post("/cities", data);
}
export function deleteCity(id) {
  return axiosClient.delete(`/cities/${id}`);
}
// ===== gerer les spots =====
export function getSpotsByCity(cityId) {
  return axiosClient.get(`/spots/city/${cityId}`);
}
export function getSpots() { 
  return axiosClient.get("/spots");
}
export function createSpot(data) {
  return axiosClient.post("/spots", data);
}
export function deleteSpot(id) {
  return axiosClient.delete(`/spots/${id}`);
}
// ===== gerer les scams =====
export function getScamsByCity(cityId) {
  return axiosClient.get(`/scams/city/${cityId}`);
}

export function getScams() { 
  return axiosClient.get("/scams");
}
export function createScam(data) {
  return axiosClient.post("/scams", data);
}
export function deleteScam(id) {
  return axiosClient.delete(`/scams/${id}`);
}
// ===== gerer les posts =====
export function getPosts() {
  return axiosClient.get("/posts");
} 


export function uploadPostImage(file) {
  const form = new FormData();
  form.append('image', file);
  return axiosClient.post('/posts/upload', form).then(res => {
    
    const apiBase = axiosClient.defaults.baseURL || "http://localhost:5000/api";
    const serverBase = apiBase.replace(/\/api\/?$/, '');
    if (res.data.url && !res.data.url.startsWith('http')) {
      res.data.url = serverBase + res.data.url;
    }
    return res;
  });
}
export  async function getPostsByCity(cityId) {
  try {
    const res = await getPosts();
    const allPosts = res.data || [];

    const filtered = allPosts.filter(post => post.cityId.id === cityId || post.cityId === cityId);
    console.log("Filtered posts for city", cityId, filtered);
    return {
      ...res,
      data: filtered
    };
  } catch (error) {
    return {
      data: [],
      error
    };
  }
} 

export function createPost(data) {
  return axiosClient.post("/posts", data);
}

export function deletePost(postId) {
  return axiosClient.delete(`/posts/${postId}`);
}
export function updatePost(postId, data) {
  return axiosClient.patch(`/posts/${postId}`, data);
}

// like/unlike toggling
export function toggleLike(postId) {
  return axiosClient.patch(`/posts/${postId}/like`);
}

// ===== gerer les commentaires =====
export function getComments() {
  return axiosClient.get("/comments");
}

export function deleteComment(commentId) {
  return axiosClient.delete(`/comments/${commentId}`);
}
export function getCommentsByPost(postId) {
  return axiosClient.get(`/comments/post/${postId}`);
}

export function addComment(data) {
  return axiosClient.post("/comments", data);
}
// ===== CHATS AI =====
export function getChatsAi(cityId) {
  return axiosClient.get(`/chatsAi/${cityId}`);
}

export function addChatAiMessage(data) {
  return axiosClient.post("/chatsAi", data);
}

export function deleteChatAiMessage(id) {
  return axiosClient.delete(`/chatsAi/${id}`);
}
