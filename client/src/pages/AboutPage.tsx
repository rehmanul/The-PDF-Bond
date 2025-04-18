import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8">About Okkyno</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            At Okkyno, we're passionate about helping people grow beautiful, productive gardens regardless of their experience level or available space. We believe that gardening should be accessible to everyone and that growing your own food is one of the most rewarding and sustainable activities you can engage in.
          </p>
          <p className="text-gray-700">
            Our mission is to provide high-quality gardening supplies, expert advice, and practical solutions that make gardening success achievable for anyone, anywhere.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden h-72 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-6xl text-green-600 mb-3">🌱</div>
            <p className="italic text-green-800">"Helping everyone grow, one plant at a time."</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6">Our Story</h2>
      <div className="mb-12">
        <Card>
          <CardContent className="p-6">
            <p className="mb-4">
              Okkyno was founded in 2020 by a group of passionate gardeners who wanted to make gardening more accessible to urban dwellers and those with limited outdoor space. We started with a simple blog sharing container gardening tips, which quickly grew into a community of garden enthusiasts.
            </p>
            <p className="mb-4">
              As our community grew, we recognized the need for specialized products designed specifically for small-space and urban gardening. With feedback from our community, we developed and curated a collection of tools, soil mixes, seeds, and planters optimized for success in challenging environments.
            </p>
            <p>
              Today, Okkyno has evolved into a comprehensive resource for gardeners of all experience levels. We've expanded our product offerings, created in-depth educational content, and built a supportive community where gardeners can share their successes, challenges, and advice.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-gradient-to-b from-green-50">
          <CardContent className="p-6">
            <h3 className="text-xl font-medium mb-3">Sustainability</h3>
            <p>
              We are committed to promoting sustainable gardening practices and offering products that have minimal environmental impact. From biodegradable pots to organic soil amendments, we prioritize eco-friendly options.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-b from-green-50">
          <CardContent className="p-6">
            <h3 className="text-xl font-medium mb-3">Education</h3>
            <p>
              We believe that knowledge is the key to gardening success. That's why we invest heavily in creating detailed guides, videos, and resources to help you make informed decisions and develop your gardening skills.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-b from-green-50">
          <CardContent className="p-6">
            <h3 className="text-xl font-medium mb-3">Community</h3>
            <p>
              Gardening is better when shared. We foster a supportive community where gardeners can connect, share experiences, and learn from each other, regardless of their background or expertise level.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6">Meet Our Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            name: "Emma Chen",
            title: "Founder & Plant Specialist",
            bio: "Emma has over 15 years of experience in urban gardening and a degree in horticulture."
          },
          {
            name: "David Rodriguez",
            title: "Product Development",
            bio: "David combines his engineering background with a passion for sustainable design."
          },
          {
            name: "Sarah Johnson",
            title: "Content Director",
            bio: "Sarah manages our blog and educational content with expertise in botany and garden writing."
          },
          {
            name: "Michael Patel",
            title: "Customer Experience",
            bio: "Michael ensures that every customer receives expert advice and support for their gardening journey."
          }
        ].map((member, index) => (
          <Card key={index}>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-green-700 text-sm mb-2">{member.title}</p>
              <p className="text-sm text-gray-600">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-green-50 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Connect with fellow gardeners, share your successes, ask questions, and get inspired by joining our growing community of garden enthusiasts.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md">
            Follow Us on Instagram
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
            Join Our Facebook Group
          </button>
        </div>
      </div>
    </div>
  );
}