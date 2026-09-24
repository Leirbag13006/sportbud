/** SportLink — extension Tailwind (v3). Pour Tailwind v4, voir theme.css. */
module.exports = {
  theme: {
    extend: {
      colors: {
        night: { 950: '#050F0D', 900: '#0A1A17', 800: '#10271F', 700: '#173A31' },
        teal:  { 600: '#0E5A4C' },
        mint:  { 100: '#DDFBEF', 300: '#9CF3D2', 400: '#5BEBB6', 500: '#2FE0A0', 600: '#1FB982', 700: '#087A55', DEFAULT: '#2FE0A0' },
        sand:  { 50: '#F6F7F5', 100: '#ECEFEC' },
        ink:   '#0E1A18',
        gray:  { 400: '#6B7975', 600: '#4A5754' },
        sunset:{ 300: '#FFC98A', 500: '#F29A3E' },
        danger: '#F0506E',
        info: '#4FB3FF',
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      fontSize: {
        hero: ['clamp(2.5rem, 5vw + 1rem, 4.5rem)', { lineHeight: '1.05', fontWeight: '900' }],
      },
      letterSpacing: { tagline: '.32em', eyebrow: '.14em' },
      borderRadius: { sm: '8px', md: '10px', lg: '16px', xl: '24px' },
      boxShadow: {
        md: '0 6px 20px rgba(5,15,13,.10)',
        lg: '0 20px 50px rgba(5,15,13,.25)',
        glow: '0 0 0 1px rgba(47,224,160,.35), 0 0 24px rgba(47,224,160,.35)',
      },
      backgroundImage: {
        hero: 'radial-gradient(120% 90% at 0% 0%, rgba(47,224,160,.28) 0%, rgba(14,90,76,.25) 30%, transparent 60%), linear-gradient(135deg, #050F0D 0%, #0A1A17 55%, #0C2420 100%)',
        'photo-fade': 'linear-gradient(90deg, #050F0D 0%, rgba(5,15,13,.6) 35%, transparent 70%)',
      },
      maxWidth: { container: '1200px' },
    },
  },
};
