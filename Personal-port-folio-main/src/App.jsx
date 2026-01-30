import React, { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Mail, Phone, MapPin, Github, Linkedin, User, GraduationCap, Code, Star, Shield, Database, IdCard, Briefcase, Network, Menu, X } from 'lucide-react'
import Enhanced3DScene from './components/Enhanced3DScene.jsx'
import './App.css'

// Navigation Component
function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false) // Close menu after clicking
  }

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <motion.div
          className="navbar-brand"
          whileHover={{ scale: 1.05 }}
        >
          Muhammad Adam Raza
        </motion.div>
        <button
          className="sm:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className={`navbar-nav ${isMenuOpen ? 'flex' : 'hidden'} sm:flex`}>
          {['home', 'about', 'education', 'skills', 'projects', 'contact'].map((section) => (
            <motion.button
              key={section}
              onClick={() => scrollToSection(section)}
              className="capitalize"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {section}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}

// Hero Section Component
function HeroSection() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Muhammad Adam Raza</h1>
          <h2 className="text-3xl text-blue-600 mb-6">Web Developer & IT Specialist – Building websites and fixing systems.</h2>
          <p className="text-lg text-slate-600 mb-8">Creating innovative solutions through technology and problem-solving</p>
          <div className="flex space-x-4">
            <Button
              onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Learn More
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Me
            </Button>
          </div>
        </motion.div>
        <motion.div
          className="h-96"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <Enhanced3DScene />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </motion.div>
      </div>
    </section>
  )
}

// About Section Component
function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-8 flex items-center">
            <User className="mr-4 text-blue-600" />
            About Me
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-lg text-slate-600 mb-6">
                I am a passionate BSIT graduate from the University of Management and Technology with expertise in web development, IoT systems, and database management. My academic journey and hands-on project experience have equipped me with strong technical skills and problem-solving abilities.
              </p>
              <p className="text-lg text-slate-600 mb-6">
                What sets me apart is my ability to quickly learn new technologies and adapt to changing requirements. I thrive in collaborative environments and enjoy tackling complex challenges to create efficient, user-friendly solutions.
              </p>
            </div>
            <div className="space-y-4">
              <motion.div
                className="flex items-center p-4 bg-blue-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <GraduationCap className="text-blue-600 mr-4" />
                <span className="text-slate-700">BSIT Graduate from UMT</span>
              </motion.div>
              <motion.div
                className="flex items-center p-4 bg-blue-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <Star className="text-blue-600 mr-4" />
                <span className="text-slate-700">7+ Completed Projects</span>
              </motion.div>
              <motion.div
                className="flex items-center p-4 bg-blue-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <Code className="text-blue-600 mr-4" />
                <span className="text-slate-700">5+ Programming Languages</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Education Section Component
function EducationSection() {
  const educationData = [
    {
      degree: "BSIT (Bachelor of Science in Information Technology)",
      institution: "University of Management and Technology",
      period: "2021 - 2025"
    },
    {
      degree: "ICS (Intermediate in Computer Science)",
      institution: "KPS College, Lahore, Punjab",
      period: "2019 - 2021"
    },
    {
      degree: "Matriculation",
      institution: "The Educators, BISE Lahore, Punjab",
      period: "2017 - 2019"
    }
  ]
  return (
    <section id="education" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-12 text-center">Education</h2>
          <div className="space-y-8">
            {educationData.map((edu, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-bold text-slate-800 mb-2">{edu.degree}</h3>
                <p className="text-blue-600 font-semibold mb-1">{edu.institution}</p>
                <p className="text-slate-600">{edu.period}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Skills Section Component
function SkillsSection() {
  const description = "A comprehensive list of my technical skills and expertise"
  const skillCategories = [
    {
      title: "Programming Languages",
      skills: ["C++/OOP", "Python", "HTML", "CSS", "JavaScript"]
    },
    {
      title: "Frameworks & Libraries",
      skills: ["React", "Bootstrap", "Flask"]
    },
    {
      title: "Databases",
      skills: ["MS SQL Server", "MongoDB"]
    },
    {
      title: "Tools & Technologies",
      skills: ["Cisco Packet Tracer", "Arduino", "Basic Linux", "MS Office"]
    }
  ]
  return (
    <section id="skills" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-12 text-center">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skillCategories.map((category, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-lg font-bold text-slate-800 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.li
                      key={skillIndex}
                      className="text-slate-600"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: (index * 0.1) + (skillIndex * 0.05) }}
                      viewport={{ once: true }}
                    >
                      • {skill}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Projects Section Component
function ProjectsSection() {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(null)
  const projects = [
    {
      title: "Aegis Digital Umbrella",
      description: "AI-Driven Vulnerability Scanner for SQLI, XSS & CSRF attacks with real-time threat detection",
      icon: Shield,
      images: ["/images/1.png", "/images/2.png", "/images/3.png"],
      technologies: ["Python", "MongoDB", "AI", "Flask", "Web Security", "SQL Injection", "Cross-Site Scripting", "Cross-Site Request Forgery"],
      features: [
        "Automated vulnerability detection",
        "Real-time threat analysis",
        "Comprehensive reporting system",
        "User-friendly dashboard"
      ]
    },
    {
      title: "Office Employment System",
      description: "Comprehensive employee management system with attendance tracking and payroll features",
      icon: Briefcase,
      technologies: ["C++", "OOP"],
      features: [
        "Employee database management",
        "Attendance tracking",
        "Payroll calculation",
        "Reporting module"
      ]
    },
    {
      title: "Software House Database",
      description: "Relational database system for software development company",
      icon: Database,
      images: ["/images/d1.png", "/images/d2.png", "/images/d3.png", "/images/d4.png", "/images/d5.png", "/images/d6.png", "/images/d7.png", "/images/d8.png", "/images/d9.png ", "/images/d10.png", "/images/d11.png", "/images/d12.png", "/images/d13.png", "/images/d14.png" , "/images/d15.png"],
      technologies: ["MS SQL Server", "Database Design"],
      features: [
        "Project management",
        "Employee records",
        "Client information",
        "Task tracking"
      ]
    },
    {
      title: "TO-DO list App",
      description: "Cross-platform productivity app with Firebase backend synchronization",
      icon: IdCard,
      images: ["/images/m1.jpg", "/images/m2.jpg", "/images/m3.jpg"],
      technologies: ["Flutter", "Dart", "Firebase Firestore", "Provider"],
      features: [
        "Cross-platform support",
        "Real-time data synchronization",
        "Offline capabilities",
        "Task management"
      ]
    },
    {
      title: "E-Commerce Website",
      description: "Responsive front-end for online store with product catalog and shopping cart functionality. It is a frontend website only",
      icon: Briefcase,
      images: ["/images/e shop 1.png", "/images/eshop 3.png", "/images/eshop2.png"],
      technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
      features: [
        "Product catalog",
        "Shopping cart functionality",
        "User registration/login",
        "Responsive design"
      ]
    },
    {
      title: "Student Attendance System",
      description: "IoT-based automated attendance tracking system using RFID technology",
      icon: User,
      images: ["/images/iot1.png", "/images/iot2.png", "/images/iot3.png"],
      technologies: ["Arduino", "RFID", "C++", "Database"],
      features: [
        "RFID card scanning",
        "Data export functionality",
        "Real-time attendance tracking",
        "Student management"
      ]
    },
    {
      title: "Network Simulation",
      description: "Enterprise network simulation with multiple departments and security zones",
      icon: Network,
      images: ["/images/n1.png", "/images/n2.png", "/images/n3.png","/images/n4.png","/images/n5.png","/images/n6.png"],
      technologies: ["Cisco Packet Tracer", "Networking"],
      features: [
        "DHCP and DNS configuration",
        "VLAN segmentation",
        "Topology design"
      ]
    }
  ]

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-4 text-center flex items-center justify-center">
            <Star className="mr-4 text-blue-600" />
            Featured Projects
          </h2>
          <p className="text-lg text-slate-600 mb-12 text-center">A showcase of my technical projects and academic work</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                onClick={() => project.images && setSelectedImageIndex({ images: project.images, currentIndex: 0 })}
                style={project.images ? { cursor: 'pointer' } : {}}
              >
                <div className="bg-gradient-to-r from-slate-800 to-blue-600 p-6 text-white flex items-center">
                  <project.icon className="w-8 h-8 mr-4" />
                  <h3 className="text-xl font-bold">{project.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 mb-4 h-24 overflow-hidden">{project.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                      <Code className="w-4 h-4 mr-2 text-blue-600" />
                      Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {project.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-slate-600 text-sm">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {selectedImageIndex && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(null);
              }}
            >
              <div className="relative">
                <img
                  src={selectedImageIndex.images[selectedImageIndex.currentIndex]}
                  alt="Project"
                  className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-2xl"
                />
                <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-full shadow"
                >
                  ✕
                </button>
                {selectedImageIndex.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(prev => ({
                          ...prev,
                          currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                        }));
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white text-black px-3 py-1 rounded-full shadow"
                    >
                      ←
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(prev => ({
                          ...prev,
                          currentIndex: (prev.currentIndex + 1) % prev.images.length
                        }));
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-black px-3 py-1 rounded-full shadow"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// Contact Section Component
function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-4 text-center">Get In Touch</h2>
          <p className="text-lg text-slate-600 mb-12 text-center">Feel free to reach out for collaboration or opportunities</p>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Mail className="mr-4 text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-6">
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Mail className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Email</h4>
                    <a href="mailto:adam5t7@gmail.com" className="text-blue-600 hover:underline">
                      adam5t7@gmail.com
                    </a>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Phone className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Phone</h4>
                    <a href="tel:+923264180993" className="text-blue-600 hover:underline">
                      +92 326 4180993
                    </a>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Address</h4>
                    <p className="text-slate-600">115A Ghusul Azam Colony, Near Sherpao Bridge, Gulberg 2, Lahore</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2025 Muhammad Adam Raza. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <motion.a
              href="https://www.linkedin.com/in/muhammad-adam-raza-380796312/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Linkedin className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://github.com/MuhammadAdamRaza"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Github className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="mailto:adam5t7@gmail.com"
              className="hover:text-blue-400 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Mail className="w-6 h-6" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main App Component
function App() {
  return (
    <div className="App">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <EducationSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

export default App