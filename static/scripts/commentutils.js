/** Returns all comments using the provided issue ID. */
export const fetchComments = async (lang, title) => {
/*
    const response = await fetch(`/.netlify/functions/comments?lang=${lang}&title=${title}`);
    const { data: comments, error } = await response.json();
*/
    fetch(`/.netlify/functions/comments?lang=${lang}&title=${title}`)
    .then(response => response.json()
    .then(data => ({
          data: comments,
          error: response.error
      })
    ).then(res => {
      console.log(res.status, res.data)
    }));

    if (error || typeof comments === 'undefined') {
      console.error('no answer from query')
      throw new Error('no answer from query');
    }
    return comments;
  };
  
  /** Renders the given list of comments, converting markdown to HTML. */
  export const renderComments = async (comments) => {
    const commentsSection = document.querySelector('#storedcomments');
    const commentsWrapper = commentsSection.querySelector('#comments-wrapper');
    const commentsCounter = commentsSection.querySelector('#comments-count');
    const commentsPlaceholder = commentsSection.querySelector('#comments-placeholder');
  
    if (!comments.length) {
      commentsPlaceholder.innerHTML = `No comments yet.`;
      return;
    }
  
    commentsCounter.innerText = `${comments.length} `;
    const commentsList = document.createElement('ol');
    commentsList.className = 'stack gap-10';
    commentsList.innerHTML = comments
      .map((comment, i) => {
        const { user, isAuthor, datePosted, body } = comment;
        const authorPillId = `author-${i}`;
        return `<li>
                  <article class="post-comment stack gap-0">
                    <header class="post-comment-meta">
                        ${user}
                      <span class="fs-sm">
                        commented ${datePosted}
                      </span>
                      ${
                        isAuthor
                          ? `<span id="${authorPillId}" class="pill post-comment-author" data-shape="round" data-size="xs">Author</span>`
                          : ''
                      }
                    </header>
                    <div class="post-comment-body rhythm">${body}</div>
                  </article>
                </li>`;
      })
      .join('');
  
    commentsWrapper.innerHTML = '';
    commentsWrapper.appendChild(commentsList);
  };
  