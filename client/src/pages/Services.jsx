import React from 'react';
import { Helmet } from 'react-helmet-async';

const Services = () => {
  const services = [
    {
      icon: "🏠",
      title: "Buy Property",
      description: "Find your dream home with our curated selection of luxury properties across UAE"
    },
    {
      icon: "🔑",
      title: "Rent Property",
      description: "Premium rental options for short-term and long-term leases"
    },
    {
      icon: "📈",
      title: "Investment Advisory",
      description: "Expert guidance on high-yield investment opportunities in UAE real estate"
    },
    {
      icon: "🏗️",
      title: "Off-Plan Projects",
      description: "Access to the latest off-plan developments with attractive payment plans"
    },
    {
      icon: "🤝",
      title: "Property Management",
      description: "Full-service property management for investors and landlords"
    },
    {
      icon: "💰",
      title: "Mortgage Assistance",
      description: "Help with financing options and mortgage approvals"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Services - Bin Thani Real Estate</title>
        <meta name="description" content="Premium real estate services in Sharjah, Dubai, and Abu Dhabi" />
      </Helmet>
      
      <div className="services-page">
        <section className="page-hero">
          <div className="container">
            <h1 className="hero-title">Our Services</h1>
            <p className="hero-subtitle">Excellence in every transaction</p>
          </div>
        </section>

        <section className="services-grid">
          <div className="container">
            <div className="services-list">
              {services.map((service, index) => (
                <div key={index} className="service-card" style={{animationDelay: `${index * 0.1}s`}}>
                  <span className="service-icon">{service.icon}</span>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .services-page {
          padding-top: 100px;
          min-height: 100vh;
        }
        
        .page-hero {
          text-align: center;
          padding: 60px 20px;
          background: linear-gradient(180deg, #080808 0%, #0a0a0a 100%);
        }
        
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 4rem;
          font-weight: 300;
          color: #fff;
          margin-bottom: 20px;
          letter-spacing: 0.1em;
        }
        
        .hero-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.2rem;
          color: #A8A8A8;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        
        .services-grid {
          padding: 80px 20px;
          background: #080808;
        }
        
        .services-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .service-card {
          background: #111111;
          border: 1px solid #222;
          padding: 50px 40px;
          transition: all 0.4s ease;
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }
        
        .service-card:hover {
          border-color: #B8960C;
          transform: translateY(-10px);
        }
        
        .service-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 25px;
        }
        
        .service-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 500;
          color: #fff;
          margin-bottom: 15px;
        }
        
        .service-description {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          color: #A8A8A8;
          line-height: 1.8;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .services-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default Services;
