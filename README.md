# somnia

Beautifully RESTful.

## Installation

```bash
npm install @truefusion/somnia --save
```

## API

Basic syntax: `somnia(URL, OPTIONS).METHOD(DATA, OPTIONS): Promise`

**METHOD:** HTTP verb.<br>
**OPTIONS:** [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options) options.

## Examples

```javascript
import somnia from 'somnia';

var blog = somnia('/blog');

/* /blog/posts */
var posts = blog('posts');
posts.post({
    title: 'somnia',
});

/* /blog/posts?category=javascript */
posts.get({
    category: 'javascript',
});

/* /blog/posts/1 */
var firstPost = posts(1);
firstPost.get();
firstPost.put({ title: 'somnia is simple' });
firstPost.patch({ title: 'somnia is really simple' });
firstPost.delete();

var firstPostComments = firstPost('1/comments');

/* /blog/posts/1/comments */
firstPostComments.get();

/* /blog/posts/1/comments/1 */
firstPostComments(1).get();
```

Easily converts to string:

```javascript
String(somnia('/blog/posts')) // "/blog/posts"
```

To catch errors:

```javascript
somnia('/posts')
  .get()
  .catch(function({ statusText }) {
    console.log(statusText);
});
```

```javascript
var posts = somnia('/blog/posts', fetchOptions);
var comments = posts('1/comments'); // Will inherit fetchOptions
```
