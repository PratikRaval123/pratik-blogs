import { BlogPost, PaginatedResponse } from '../types';

// Initial Mock Data (High Quality)
const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of AI in Web Development',
    excerpt: 'How generative AI is reshaping the way we build and deploy web applications.',
    content: 'Artificial Intelligence is no longer just a buzzword. It is fundamentally changing how developers write code, test applications, and even design user interfaces. From automated testing to intelligent code completion, the landscape is shifting rapidly...',
    author: 'Sarah Jenkins',
    date: 'Oct 24, 2023',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    readTime: '5 min read',
    tags: ['AI', 'Tech', 'Future']
  },
  {
    id: '2',
    title: 'Mastering Tailwind CSS',
    excerpt: 'A deep dive into utility-first CSS and how to build responsive layouts faster.',
    content: 'Tailwind CSS has revolutionized styling by providing a low-level utility belt. Instead of fighting with cascading overrides, developers can now compose designs directly in their markup. This guide explores advanced configuration...',
    author: 'Mike Chen',
    date: 'Oct 22, 2023',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    readTime: '8 min read',
    tags: ['CSS', 'Design', 'Frontend']
  },
  {
    id: '3',
    title: 'The Zen of React Hooks',
    excerpt: 'Understanding the mental model behind useEffect and useState.',
    content: 'Hooks introduced a new way to share stateful logic between components. However, they also introduced new pitfalls like infinite loops in useEffect. Let us unravel the mysteries of dependency arrays...',
    author: 'Emily Tao',
    date: 'Oct 20, 2023',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    readTime: '6 min read',
    tags: ['React', 'Code', 'Tutorial']
  },
  {
    id: '4',
    title: 'Minimalism in Digital Design',
    excerpt: 'Why less is often more when it comes to user experience.',
    content: 'Visual clutter kills conversion. In this post, we explore the principles of minimalism: whitespace, typography, and color theory. Learn how to guide the user eye without overwhelming them...',
    author: 'Alex Rivera',
    date: 'Oct 18, 2023',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    readTime: '4 min read',
    tags: ['UX', 'Design', 'Minimalism']
  },
  {
    id: '5',
    title: 'Exploring the Cosmos',
    excerpt: 'New discoveries from the James Webb Telescope.',
    content: 'The universe is vast and full of mysteries. Recent images from the JWST have revealed galaxies formed shortly after the Big Bang, challenging our current models of cosmology...',
    author: 'Dr. Alan Grant',
    date: 'Oct 15, 2023',
    imageUrl: 'https://picsum.photos/800/600?random=5',
    readTime: '10 min read',
    tags: ['Space', 'Science', 'Astronomy']
  }
];

// Generator for 500+ posts to simulate a large database
const generateLargeDataset = (): BlogPost[] => {
    const titles = [
        "The Secrets of Javascript", "Understanding Cloud Computing", "Healthy Habits for Devs",
        "The Rise of Remote Work", "Machine Learning Basics", "Cybersecurity Trends",
        "Mobile App Design", "Digital Marketing 101", "Blockchain Explained", "UI/UX Best Practices",
        "The Power of Python", "Rust vs Go", "Sustainable Tech", "Smart Home Innovations", "VR and AR Futures"
    ];
    const authors = ["John Doe", "Jane Smith", "Robert Brown", "Lisa Wang", "David Wilson", "Emma Clark", "James Bond"];
    const tagsList = ["Tech", "Life", "Coding", "Business", "Health", "Innovation", "Future", "Science"];
    
    const extraPosts: BlogPost[] = [];
    
    for (let i = 0; i < 500; i++) {
        const randTitle = titles[Math.floor(Math.random() * titles.length)];
        const randAuthor = authors[Math.floor(Math.random() * authors.length)];
        const randTag = tagsList[Math.floor(Math.random() * tagsList.length)];
        const date = new Date(Date.now() - Math.floor(Math.random() * 31536000000)); // Random date in last year
        
        extraPosts.push({
            id: `gen-${i}`,
            title: `${randTitle} - Vol. ${i + 1}`,
            excerpt: `This is an automatically generated summary for post volume ${i + 1}. It discusses key insights regarding ${randTitle.toLowerCase()} and why it matters today.`,
            content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nThis is placeholder content for article number ${i + 1}.`,
            author: randAuthor,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            imageUrl: `https://picsum.photos/800/600?random=${i + 20}`,
            readTime: `${Math.floor(Math.random() * 10) + 3} min read`,
            tags: [randTag, 'Archive']
        });
    }
    return extraPosts;
};

// Simulating an in-memory database with initial + generated posts
let memoryPosts = [...INITIAL_POSTS, ...generateLargeDataset()];

export const getPosts = async (cursor: number = 0, limit: number = 6): Promise<PaginatedResponse<BlogPost>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const start = cursor;
  const end = start + limit;
  const sliced = memoryPosts.slice(start, end);
  
  return {
    data: sliced,
    hasMore: end < memoryPosts.length,
    nextCursor: end < memoryPosts.length ? end : null
  };
};

export const createPost = async (post: Omit<BlogPost, 'id' | 'date' | 'readTime'>): Promise<BlogPost> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newPost: BlogPost = {
    ...post,
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: `${Math.ceil(post.content.length / 500)} min read`
  };
  
  // Add to beginning
  memoryPosts = [newPost, ...memoryPosts];
  return newPost;
};

export const deletePost = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  memoryPosts = memoryPosts.filter(p => p.id !== id);
};

// Helper for the hero slider (get top 5)
export const getFeaturedPosts = async (): Promise<BlogPost[]> => {
    return memoryPosts.slice(0, 5);
}