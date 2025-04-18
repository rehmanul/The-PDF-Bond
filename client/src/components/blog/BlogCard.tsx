import { Link } from 'wouter';
import { Calendar, MessageSquare } from 'lucide-react';
import { BlogPost } from '@shared/schema';
import { formatShortDate, truncateText } from '@/utils/formatters';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'compact';
}

export default function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  const imageHeight = variant === 'compact' ? 'h-32' : 'h-48';
  const contentPadding = variant === 'compact' ? 'p-4' : 'p-6';
  
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <Link href={`/blog/${post.slug}`}>
        <a className="block">
          <div className={`relative ${imageHeight} overflow-hidden`}>
            <img 
              src={post.imageUrl || "https://images.unsplash.com/photo-1527069438729-2eb562e7c9e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
              alt={post.title} 
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </div>
          <div className={contentPadding}>
            <div className="flex items-center mb-2 text-sm text-gray-600">
              <span className="mr-4 flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> 
                {formatShortDate(post.createdAt)}
              </span>
              <span className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" /> 
                {post.commentCount} Comments
              </span>
            </div>
            <h3 className={`font-heading font-bold ${variant === 'compact' ? 'text-lg' : 'text-xl'} mb-2 hover:text-primary transition`}>
              {post.title}
            </h3>
            {variant === 'default' && (
              <p className="text-gray-600 mb-4 line-clamp-2">
                {post.excerpt || truncateText(post.content.replace(/<[^>]*>/g, ''), 150)}
              </p>
            )}
            <span className="text-primary font-semibold hover:underline">Read More</span>
          </div>
        </a>
      </Link>
    </article>
  );
}
