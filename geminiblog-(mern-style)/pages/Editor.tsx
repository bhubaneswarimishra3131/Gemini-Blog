import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/mockBackend';
import { generateBlogContent } from '../services/geminiService';
import { Post, AiActionType } from '../types';
import { Wand2, Save, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api.getPostById(id).then(post => {
        if (post) {
            // Ensure only author can edit
            if(user && post.authorId !== user.id) {
                navigate('/');
                return;
            }
            setTitle(post.title);
            setContent(post.content);
            setSummary(post.summary);
            setTags(post.tags.join(', '));
        }
      });
    }
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSaving(true);
    try {
      const postData = {
        title,
        content,
        summary: summary || content.substring(0, 150),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (id) {
        await api.updatePost(id, postData);
        navigate(`/post/${id}`);
      } else if (user) {
        const newPost = await api.createPost(postData, user);
        navigate(`/post/${newPost.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiAction = async (action: AiActionType) => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      let result = '';
      if (action === AiActionType.GENERATE_TITLE) {
        result = await generateBlogContent(action, '', content);
        if (result) setTitle(result);
      } else if (action === AiActionType.SUMMARIZE) {
        result = await generateBlogContent(action, '', content);
        if (result) setSummary(result);
      } else if (action === AiActionType.FIX_GRAMMAR) {
        // For grammar, we might just fix the selected text or whole text
        // For simplicity, let's just fix the whole content or first 2000 chars to avoid token limits in demo
        result = await generateBlogContent(action, content, '');
        if (result) setContent(result);
      } else if (action === AiActionType.EXPAND_TEXT) {
          // If a section is small, expand it. Here we just append.
          const lastParagraph = content.split('\n').pop() || title;
          result = await generateBlogContent(action, lastParagraph, '');
          if(result) setContent(prev => prev + '\n\n' + result);
      }
    } catch (err: any) {
      setAiError(err.message || "AI Error");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
           <div>
               <h1 className="text-3xl font-bold text-gray-900">{id ? 'Edit Story' : 'New Story'}</h1>
               <p className="text-gray-500 mt-1">Share your knowledge with the world</p>
           </div>
           <div className="flex items-center gap-3">
             <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
             <button 
               type="submit" 
               disabled={isSaving}
               className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium shadow-lg shadow-gray-200"
             >
               {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
               {id ? 'Update' : 'Publish'}
             </button>
           </div>
        </div>

        {/* AI Toolbar */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2 text-indigo-700 font-semibold mr-2">
               <Sparkles size={18} />
               <span>Gemini AI Helper</span>
           </div>
           <div className="h-6 w-px bg-indigo-200 hidden sm:block"></div>
           <button 
             type="button" 
             onClick={() => handleAiAction(AiActionType.GENERATE_TITLE)}
             disabled={isAiLoading || !content}
             className="text-xs sm:text-sm bg-white text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm"
           >
             Suggest Title
           </button>
           <button 
             type="button" 
             onClick={() => handleAiAction(AiActionType.SUMMARIZE)}
             disabled={isAiLoading || !content}
             className="text-xs sm:text-sm bg-white text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm"
           >
             Generate Summary
           </button>
           <button 
             type="button" 
             onClick={() => handleAiAction(AiActionType.FIX_GRAMMAR)}
             disabled={isAiLoading || !content}
             className="text-xs sm:text-sm bg-white text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm"
           >
             Fix Grammar
           </button>
           <button 
             type="button" 
             onClick={() => handleAiAction(AiActionType.EXPAND_TEXT)}
             disabled={isAiLoading || !content}
             className="text-xs sm:text-sm bg-white text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm"
           >
             Continue Writing
           </button>
           
           {isAiLoading && <Loader2 className="animate-spin text-indigo-600 ml-auto" size={18} />}
           
           {aiError && (
              <div className="w-full mt-2 text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle size={14} /> {aiError}
              </div>
           )}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Article Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 bg-transparent py-4 focus:ring-0"
          />
          
          <input 
            type="text"
            placeholder="Comma separated tags (e.g. tech, lifestyle)..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full text-sm text-gray-500 border-none outline-none placeholder-gray-300 bg-transparent focus:ring-0 pb-4 border-b border-gray-100"
          />

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
               type="button"
               onClick={() => setActiveTab('write')}
               className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'write' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Write
            </button>
            <button
               type="button"
               onClick={() => setActiveTab('preview')}
               className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Preview
            </button>
          </div>

          {activeTab === 'write' ? (
            <div className="relative">
                <textarea
                  placeholder="Tell your story... (Markdown supported)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[500px] resize-y text-lg leading-relaxed text-gray-800 border-none outline-none focus:ring-0 placeholder-gray-300 bg-transparent p-0"
                />
            </div>
          ) : (
             <div className="prose prose-lg prose-indigo max-w-none min-h-[500px]">
                <ReactMarkdown>{content || '*Nothing to preview yet...*'}</ReactMarkdown>
             </div>
          )}
          
          {/* Summary / Meta */}
          <div className="pt-8 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Summary (for SEO card)</label>
              <textarea
                 rows={3}
                 value={summary}
                 onChange={(e) => setSummary(e.target.value)}
                 className="w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-600"
                 placeholder="Briefly describe what this article is about..."
              />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Editor;