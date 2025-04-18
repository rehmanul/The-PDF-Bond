import { Link } from "wouter";
import { BlogPost } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = formatDistanceToNow(new Date(post.publishDate), { addSuffix: true });

  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group bg-neutral rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md h-full flex flex-col">
        <div className="h-52 overflow-hidden">
          <img 
            src={`${post.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80`} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <span className="text-primary text-sm font-semibold mb-2">{post.category}</span>
          <h3 className="font-bold text-xl text-dark mb-3 group-hover:text-primary transition">{post.title}</h3>
          <p className="text-gray-600 text-sm mb-4 flex-grow">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {post.authorImageUrl && (
                <img 
                  src={`${post.authorImageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80`} 
                  alt={post.authorName} 
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <span className="text-xs text-gray-500">{post.authorName}</span>
            </div>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
