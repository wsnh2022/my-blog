import React from 'react';
import { useParams } from 'react-router-dom';

const Post = () => {
    const { id } = useParams();
    return (
        <div>
            <h2>Blog Post</h2>
            <p>Viewing post with ID: {id}</p>
        </div>
    );
};

export default Post;
