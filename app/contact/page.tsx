'use client';

import { Mail, Phone, Globe, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/components/magicui/blur-fade';
import { BlurFadeText } from '@/components/magicui/blur-fade-text';
import { motion } from '@/lib/motion';
import { Navbar } from '@/components/Navbar';
import { Marquee } from '@/components/magicui/marquee';
import Script from 'next/script';

const ContactPage = () => {
  const contactInfo = {
    email: 'riteshhiremath6@gmail.com',
    phone: '+91 9663946352',
    twitter: '@ritesh_hiremath',
    website: 'riteshhiremath.com',
  };

  const tweetIds = [
    '1918352622811267313',
    '1917133149538291981',
    '1917079255759917448'
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col min-h-screen dark:bg-neutral-950 bg-white">
      <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
      <Navbar variant="landing" />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
              <BlurFadeText>Contact</BlurFadeText>
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Let's discuss your logo design needs. I'm here to help bring your brand vision to life.
            </p>
          </motion.div>
        </section>

        {/* Split Layout Section */}
        <section className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-2 items-start">
            {/* Contact Information - Left Side */}
            <div className="space-y-6 text-center lg:text-left">
              {/* Email */}
              <BlurFade delay={0.2} inView>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Email</h2>
                  <p className="text-lg text-neutral-800 dark:text-neutral-200 mb-3 font-medium">{contactInfo.email}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(contactInfo.email)}
                    className="rounded-full mx-auto lg:mx-0"
                  >
                    Copy Email
                  </Button>
                </div>
              </BlurFade>

              {/* Phone */}
              <BlurFade delay={0.3} inView>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Phone</h2>
                  <p className="text-lg text-neutral-800 dark:text-neutral-200 mb-3 font-medium">{contactInfo.phone}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(contactInfo.phone)}
                    className="rounded-full mx-auto lg:mx-0"
                  >
                    Copy Phone
                  </Button>
                </div>
              </BlurFade>

              {/* Social Links */}
              <BlurFade delay={0.4} inView>
                <div className="mb-8 lg:mb-0">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Social</h2>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Button
                      size="sm"
                      onClick={() => window.open(`https://twitter.com/${contactInfo.twitter.replace('@', '')}`)}
                      className="rounded-full"
                    >
                      <Twitter className="w-4 h-4" />
                      Follow on X
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(`https://${contactInfo.website}`)}
                      className="rounded-full"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </Button>
                  </div>
                </div>
              </BlurFade>
            </div>

            {/* Twitter Feed Marquee */}
            <div className="relative min-h-[500px] flex items-center overflow-hidden mt-8 lg:mt-0">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white dark:from-neutral-950 dark:via-transparent dark:to-neutral-950 z-10" />
              <Marquee vertical pauseOnHover className="h-[500px] w-full">
                {tweetIds.map((tweetId) => (
                  <div key={tweetId} className="my-4 w-full px-4 lg:px-0">
                    <div
                      className="twitter-tweet twitter-tweet-rendered"
                      style={{ width: '100%' }}
                    >
                      <iframe
                        id={`twitter-widget-${tweetId}`}
                        scrolling="no"
                        frameBorder="0"
                        allow="fullscreen"
                        className="w-full"
                        style={{
                          position: 'static',
                          visibility: 'visible',
                          width: '100%',
                          height: '300px',
                          display: 'block',
                          flexGrow: 1,
                        }}
                        title="Twitter Tweet"
                        src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`}
                      ></iframe>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </section>

        {/* Response Time Info */}
        <section className="py-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-center">
            <BlurFade delay={0.5} inView>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                I typically respond to all inquiries within 24 hours.
              </p>
            </BlurFade>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;