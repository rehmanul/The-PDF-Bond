import { Link } from "wouter";
import { BlogPost } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center mb-2 text-sm text-gray-600">
            <span className="mr-4">
              <i className="far fa-calendar mr-1"></i> 
              {post.publishedAt ? formatDate(post.publishedAt) : "Draft"}
            </span>
            <span>
              <i className="far fa-comment mr-1"></i> 
              {post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
            </span>
          </div>
          <h3 className="font-bold text-xl mb-2 hover:text-primary transition">
            {post.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {post.excerpt}
          </p>
          <span className="text-primary font-semibold hover:underline">Read More</span>
        </CardContent>
      </Link>
    </Card>
  );
}
