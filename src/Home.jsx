import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        // Vite's magic glob to find all .md files in src/posts
        const postModules = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true });

        const postData = Object.keys(postModules).map((path) => {
            const filename = path.split('/').pop();
            const id = filename.replace('.md', '');
            const text = postModules[path];

            // SIMPLE BROWSER-FRIENDLY FRONTMATTER PARSER
            let title = id.split('-').join(' ');
            let date = 'Project Post';
            let content = text;
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
                const firstLine = text.split('\n')[0];
                title = firstLine.replace('# ', '').trim();
                content = text.split('\n').slice(1).join('\n').trim();
            }

            return {
                id,
                title,
                date,
                image,
                excerpt: content.slice(0, 150).replace(/[#*`]/g, '') + '...',
            };
        });

        setPosts(postData);
    }, []);

    return (
        <div className="container">
            <header>
                <h1>My Dynamic Blog</h1>
                <p>Well-structured, professional, and bloat-free.</p>
            </header>

            <div className="posts-grid">
                {posts.map((post) => (
                    <Link to={`/post/${post.id}`} key={post.id} className="post-card">
                        <div className="card-image-container">
                            {post.image ? (
                                <img src={post.image} alt={post.title} className="card-image" />
                            ) : (
                                <div className="card-image" style={{ background: 'var(--header-grad)', opacity: 0.8 }} />
                            )}
                        </div>
                        <div className="card-content">
                            <div className="post-date" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{post.date}</div>
                            <h2>{post.title}</h2>
                            <p>{post.excerpt}</p>
                            <span className="read-more">Read Full Post</span>
                        </div>
                    </Link>
                ))}
            </div>

            {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p>No posts found. Add .md files to your <code>src/posts</code> folder!</p>
                </div>
            )}
        </div>
    );
};

export default Home;
