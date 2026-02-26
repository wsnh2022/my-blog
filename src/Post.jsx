import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Post = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const postModules = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true });
            const postPath = Object.keys(postModules).find(path => path.includes(`${id}.md`));

            if (postPath) {
                const text = postModules[postPath].trim();

                let title = id.split(/[-_]/).join(' ').replace(/\b\w/g, l => l.toUpperCase());
                let content = text;
                let date = '';
                let image = null;

                // 1. PARSE LOCAL FRONTMATTER
                if (text.startsWith('---')) {
                    const parts = text.split('---');
                    if (parts.length >= 3) {
                        const yaml = parts[1];
                        content = parts.slice(2).join('---').trim();
                        const titleMatch = yaml.match(/title:\s*(.*)/);
                        const dateMatch = yaml.match(/date:\s*(.*)/);
                        const imageMatch = yaml.match(/image:\s*(.*)/);
                        if (titleMatch) title = titleMatch[1].replace(/['"]/g, '').trim();
                        if (dateMatch) date = dateMatch[1].replace(/['"]/g, '').trim();
                        if (imageMatch) image = imageMatch[1].replace(/['"]/g, '').trim();
                    }
                }

                // 2. CHECK FOR REMOTE URL
                const firstLine = content.split('\n')[0].trim();
                if (firstLine.startsWith('https://github.com/')) {
                    try {
                        const rawUrl = firstLine
                            .replace('github.com', 'raw.githubusercontent.com')
                            .replace('/blob/', '/');

                        const response = await fetch(rawUrl);
                        if (response.ok) {
                            content = await response.text();

                            // Try to get title from remote content if not in local frontmatter
                            if (!title || title === id.split(/[-_]/).join(' ').replace(/\b\w/g, l => l.toUpperCase())) {
                                const headerMatch = content.match(/^#\s+(.*)/m);
                                if (headerMatch) title = headerMatch[1].trim();
                            }
                        }
                    } catch (err) {
                        console.error('Failed to fetch remote content:', err);
                    }
                } else if (!title || title === id.split(/[-_]/).join(' ').replace(/\b\w/g, l => l.toUpperCase())) {
                    // Fallback local title detection
                    const headerMatch = content.match(/^#\s+(.*)/m);
                    if (headerMatch) title = headerMatch[1].trim();
                }

                setPost({ title, content, date, image });
            }
            setLoading(false);
        };

        fetchContent();

        const handleThemeChange = () => {
            setTheme(localStorage.getItem('theme') || 'light');
        };
        const interval = setInterval(handleThemeChange, 500);

        return () => clearInterval(interval);
    }, [id]);

    if (loading) return (
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="loading-spinner" style={{
                border: '4px solid var(--border-color)',
                borderTop: '4px solid var(--primary-color)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
            }}></div>
            <p>Syncing with GitHub...</p>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    if (!post) return <div className="container">Post not found.</div>;

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <Link to="/" className="back-link">Back to Blog</Link>

            <article className="post-detail">
                {post.image && (
                    <img src={post.image} alt={post.title} className="post-hero-image" />
                )}
                <div className="post-detail-content">
                    <header style={{ background: 'none', color: 'inherit', textAlign: 'left', padding: '0', marginBottom: '3rem', boxShadow: 'none' }}>
                        <h1 style={{ color: 'var(--text-main)', fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>{post.title}</h1>
                        {post.date && <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{post.date}</p>}
                    </header>

                    <div className="post-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={theme === 'dark' ? oneDark : oneLight}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                img({ node, ...props }) {
                                    // GitHub relative images fix would go here if needed
                                    return <img style={{ maxWidth: '100%', borderRadius: '1rem' }} {...props} />
                                }
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default Post;
