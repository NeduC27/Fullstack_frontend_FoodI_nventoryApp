
import Frame from '../assets/Frame.png'
import GooglePlay from '../assets/GoogleBorder.png';
import Phone1 from '../assets/PixelProMockup.png';
import Phone2 from '../assets/PixelMockuplabel.png';

export default function AppFooter() {
    return (
        <>
            <style>{`
            .footer-section {
                background: #EEF0F5;
                background-image: url(${Frame});
                background-size: cover;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 5rem;
                height: 18rem;
                position: relative;
                overflow: visible;
            }


        .footer-text-side {
          flex: 1;
          max-width: 22rem;
          z-index: 1;
        }

        .footer-title {
          font-size: 2rem;
          font-weight: 800;
          color: #0A1853;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }

        .footer-desc {
          font-size: 0.95rem;
          color: #0A1853;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .footer-google-play {
          cursor: pointer;
          display: inline-block;
          transition: transform 0.2s;
        }

        .footer-google-play:hover { transform: scale(1.03); }

        .footer-google-play img {
          height: 2.75rem;
        }

        .footer-phones {
            display: flex;
            align-items: flex-end;
            gap: 0;
            position: relative;
            flex: 1;
            justify-content: flex-end;
            z-index: 1;
            margin-bottom: -3rem;
            margin-top: -3rem;
        }

        .footer-phone-back {
        width: 10rem;
        position: relative;
        top: 2rem;
        opacity: 0.9;
        }

        .footer-phone-front {
            width: 11rem;
            position: relative;
            z-index: 2;
            margin-left: -3rem;
            top: -1rem;
        }

        @media (max-width: 1024px) {
          .footer-section { padding: 2rem 3rem; }
          .footer-title { font-size: 1.6rem; }
          .footer-phone-back { width: 9rem; }
          .footer-phone-front { width: 10rem; }
        }

        @media (max-width: 768px) {
          .footer-section {
            flex-direction: column;
            padding: 2rem 1.5rem;
            text-align: center;
            min-height: auto;
          }
          .footer-text-side { max-width: 100%; }
          .footer-title { font-size: 1.4rem; }
          .footer-desc { font-size: 0.875rem; }
          .footer-phones {
            justify-content: center;
            margin-top: 1.5rem;
          }
          .footer-phone-back { width: 7rem; }
          .footer-phone-front { width: 8rem; }
        }

        @media (max-width: 480px) {
          .footer-title { font-size: 1.2rem; }
          .footer-phone-back { width: 6rem; }
          .footer-phone-front { width: 7rem; }
        }
      `}</style>

            <footer className="footer-section">
                {/* Left: Text + Google Play */}
                <div className="footer-text-side">
                    <h2 className="footer-title">Order Food</h2>
                    <p className="footer-desc">
                        Make ordering your food easier with our mobile app. You can get it on the google play store.
                    </p>

                    <a href="https://play.google.com/store">


                        <img src={GooglePlay} alt="Get it on Google Play" />
                    </a>
                </div>

                {/* Right: Phone mockups */}
                <div className="footer-phones">
                    <img src={Phone1} alt="App mockup" className="footer-phone-back" />
                    <img src={Phone2} alt="App mockup" className="footer-phone-front" />
                </div>
            </footer>
        </>
    );
}