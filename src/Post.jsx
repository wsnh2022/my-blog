import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Post = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const postModules = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true });
        const postPath = Object.keys(postModules).find(path => path.includes(`${id}.md`));

        if (postPath) {
            const text = postModules[postPath];

            let title = id.split('-').join(' ');
            let content = text;
            let date = '';
            let image = null;

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
            } else if (text.startsWith('# ')) {
                const lines = text.split('\n');
                title = lines[0].replace('# ', '').trim();
                content = lines.slice(1).join('\n').trim();
            }

            setPost({ title, content, date, image });
        }

        const handleThemeChange = () => {
            setTheme(localStorage.getItem('theme') || 'light');
        };
        const interval = setInterval(handleThemeChange, 500);

        return () => clearInterval(interval);
    }, [id]);

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
                        <h1 style={{ color: 'var(--text-main)', fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.1' }}>{post.title}</h1>
                        {post.date && <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{post.date}</p>}
                    </header>

                    <div className="post-content">
                        <ReactMarkdown
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
