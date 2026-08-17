import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Post } from '../types';
import * as api from '../services/mockBackend';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Edit2, Trash2, ArrowLeft, Clock } from 'lucide-react';

const PostView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const data = await api.getPostById(id);
        if (data) {
          setPost(data);
        } else {
          navigate('/'); // Post not found
        }
      } catch (error) {
        console.error("Error fetching post", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (post?.id) {
        await api.deletePost(post.id);
        navigate('/');
      }
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading story...</div>;
  if (!post) return null;

  const isAuthor = user?.id === post.authorId;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="relative h-80 md:h-96 w-full">
         <img 
           src={post.coverImage} 
           alt={post.title}
           className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/60"></div>
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 text-center text-white">
                <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors">
                  <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Link>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">{post.title}</h1>
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base text-gray-200">
                  <div className="flex items-center gap-2">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} className="w-8 h-8 rounded-full border border-gray-400 bg-white" alt="avatar" />
                     <span className="font-medium text-white">{post.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{Math.ceil(post.content.length / 500)} min read</span>
                  </div>
                </div>
            </div>
         </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {isAuthor && (
          <div className="flex justify-end gap-3 mb-8 pb-8 border-b border-gray-100">
            <Link to={`/edit/${post.id}`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <Edit2 size={16} /> Edit Post
            </Link>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}

        <div className="prose prose-lg prose-indigo mx-auto text-gray-700">
          <ReactMarkdown
             components={{
                img: ({node, ...props}) => <img {...props} className="rounded-xl shadow-md my-8" />,
                h1: ({node, ...props}) => <h1 {...props} className="text-3xl font-bold text-gray-900 mt-12 mb-6" />,
                h2: ({node, ...props}) => <h2 {...props} className="text-2xl font-bold text-gray-900 mt-10 mb-5" />,
                p: ({node, ...props}) => <p {...props} className="leading-relaxed mb-6" />,
                blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-6 bg-gray-50 py-2 rounded-r" />,
                code: ({node, className, children, ...props}) => {
                   return <code className={`${className} bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>{children}</code>
                }
             }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
           <div className="flex flex-wrap gap-2">
             {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">#{tag}</span>
             ))}
           </div>
        </div>
      </article>
    </div>
  );
};

export default PostView;