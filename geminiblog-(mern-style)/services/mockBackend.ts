import { User, Post } from '../types';

// Simulation constants
const USERS_KEY = 'mern_blog_users';
const POSTS_KEY = 'mern_blog_posts';
const TOKEN_KEY = 'mern_blog_token';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Services ---

export const loginUser = async (email: string): Promise<{ user: User; token: string }> => {
  await delay(600);
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('User not found. Please register.');
  }

  const token = `fake-jwt-token-${Date.now()}`;
  localStorage.setItem(TOKEN_KEY, token);
  return { user, token };
};

export const registerUser = async (username: string, email: string): Promise<{ user: User; token: string }> => {
  await delay(600);
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const token = `fake-jwt-token-${Date.now()}`;
  localStorage.setItem(TOKEN_KEY, token);

  return { user: newUser, token };
};

export const logoutUser = async () => {
  await delay(200);
  localStorage.removeItem(TOKEN_KEY);
};

export const getCurrentUser = async (): Promise<User | null> => {
  // In a real app, we'd validate the token with the backend
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  // For this mock, we just return the last registered/logged in user associated with the session
  // In a real stateless JWT setup, the user ID is in the token. 
  // Here we'll just cheat and grab the user from the last active session logic or just pick the first match (Mock limitation)
  // To make it robust without a real backend session, let's store 'currentUserId'
  const currentUserId = localStorage.getItem('mern_blog_current_user_id');
  if(!currentUserId) return null;

  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  return users.find(u => u.id === currentUserId) || null;
};


// --- Blog Post Services ---

export const getPosts = async (): Promise<Post[]> => {
  await delay(500);
  const postsStr = localStorage.getItem(POSTS_KEY);
  return postsStr ? JSON.parse(postsStr) : [];
};

export const getPostById = async (id: string): Promise<Post | undefined> => {
  await delay(300);
  const postsStr = localStorage.getItem(POSTS_KEY);
  const posts: Post[] = postsStr ? JSON.parse(postsStr) : [];
  return posts.find(p => p.id === id);
};

export const createPost = async (postData: Partial<Post>, user: User): Promise<Post> => {
  await delay(800);
  const postsStr = localStorage.getItem(POSTS_KEY);
  const posts: Post[] = postsStr ? JSON.parse(postsStr) : [];

  const newPost: Post = {
    id: `post-${Date.now()}`,
    title: postData.title || 'Untitled',
    content: postData.content || '',
    summary: postData.summary || '',
    authorId: user.id,
    authorName: user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: postData.tags || [],
    coverImage: postData.coverImage || `https://picsum.photos/800/400?random=${Date.now()}`
  };

  posts.unshift(newPost); // Add to top
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return newPost;
};

export const updatePost = async (id: string, updates: Partial<Post>): Promise<Post> => {
  await delay(600);
  const postsStr = localStorage.getItem(POSTS_KEY);
  let posts: Post[] = postsStr ? JSON.parse(postsStr) : [];

  const index = posts.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Post not found');

  const updatedPost = {
    ...posts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  posts[index] = updatedPost;
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return updatedPost;
};

export const deletePost = async (id: string): Promise<void> => {
  await delay(400);
  const postsStr = localStorage.getItem(POSTS_KEY);
  let posts: Post[] = postsStr ? JSON.parse(postsStr) : [];
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
};

// Seed initial data if empty
const seedData = () => {
  if (!localStorage.getItem(POSTS_KEY)) {
    const seedPosts: Post[] = [
      {
        id: '1',
        title: 'Welcome to the Future of Blogging',
        summary: 'An introduction to this MERN-style blog application powered by React and Gemini.',
        content: '# Welcome!\n\nThis is a **simulated MERN stack application**. \n\nWe use `localStorage` to mock the MongoDB database, but the frontend architecture is production-ready React code.\n\n## Features\n- **JWT Auth Simulation**: Login and Register\n- **CRUD**: Create, Read, Update, Delete posts\n- **AI Power**: Use the magic wand in the editor to let Gemini help you write!\n\nEnjoy writing!',
        authorId: 'admin',
        authorName: 'System Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['welcome', 'tech'],
        coverImage: 'https://picsum.photos/800/400?random=1'
      }
    ];
    localStorage.setItem(POSTS_KEY, JSON.stringify(seedPosts));
  }
};
seedData();