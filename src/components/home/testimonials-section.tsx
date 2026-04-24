"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Zubair Ahmed",
    location: "Karachi, Sindh",
    rating: 5,
    text: "The best service for home cleaning in Karachi! I found a reliable tasker in 10 minutes and she did an amazing job. Highly recommend ErrandOwl.",
    avatar: "ZA",
    service: "Home Cleaning",
  },
  {
    name: "Sarah Malik",
    location: "Lahore, Punjab",
    rating: 5,
    text: "Excellent app for quick home repairs. I found an electrician in Lahore who fixed my AC issues same day. The payment via JazzCash was so easy!",
    avatar: "SM",
    service: "Electrical",
  },
  {
    name: "Usman Raja",
    location: "Islamabad, ICT",
    rating: 5,
    text: "As a tasker, ErrandOwl has given me a great way to earn extra income. The verification process is thorough which builds trust with clients.",
    avatar: "UR",
    service: "Tasker",
  },
  {
    name: "Ayesha Khan",
    location: "Rawalpindi, Punjab",
    rating: 5,
    text: "I've been using ErrandOwl for furniture assembly and moving help. The taskers are always professional and on time. Worth every rupee!",
    avatar: "AK",
    service: "Furniture Assembly",
  },
  {
    name: "Hassan Ali",
    location: "Faisalabad, Punjab",
    rating: 5,
    text: "The plumbing service saved my house from flooding! The tasker arrived in under 2 hours and fixed everything. Incredible response time.",
    avatar: "HA",
    service: "Plumbing",
  },
  {
    name: "Fatima Zahra",
    location: "Lahore, Punjab",
    rating: 5,
    text: "My go-to for cleaning before hosting guests. Deep cleaning service is exceptional. The tasker even brought eco-friendly products!",
    avatar: "FZ",
    service: "Deep Cleaning",
  },
];

const avatarColors = [
  "bg-owl-violet",
  "bg-owl-amber",
  "bg-owl-emerald",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-owl-emerald/10 text-owl-emerald text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Hear From Our{" "}
            <span className="gradient-text">Users</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join thousands of Pakistanis who rely on ErrandOwl every day.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl border border-border/50 bg-card hover:border-owl-violet/20 hover-lift transition-all relative">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 h-8 w-8 text-owl-violet/10 group-hover:text-owl-violet/20 transition-colors" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-owl-amber text-owl-amber"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm leading-relaxed text-foreground/80 mb-6">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${avatarColors[i]} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {review.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{review.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {review.location}
                    </div>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {review.service}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
