// Полная конфигурация всех скинов игры
const SKIN_CONFIGS = {
    default: {
        id: 'default',
        name: 'Классический',
        preview: '🎯',
        price: 0,
        enabled: true,
        description: 'Стандартный дизайн игры',
        styleConfig: {
            boardBackground: 'rgba(187, 173, 160, 0.3)',
            boardBorder: 'rgba(187, 173, 160, 0.8)',
            tileBackground: '#CDC1B4',
            tileBorder: '#BBB',
            glowEffect: 'none',
            mergeEffect: 'default',
            tileColors: {
                2: { bg: '#EEE4DA', color: '#776E65' },
                4: { bg: '#EDE0C8', color: '#776E65' },
                8: { bg: '#F2B179', color: '#F9F6F2' },
                16: { bg: '#F59563', color: '#F9F6F2' },
                32: { bg: '#F67C5F', color: '#F9F6F2' },
                64: { bg: '#F65E3B', color: '#F9F6F2' },
                128: { bg: '#EDCF72', color: '#F9F6F2' },
                256: { bg: '#EDCC61', color: '#F9F6F2' },
                512: { bg: '#EDC850', color: '#F9F6F2' },
                1024: { bg: '#EDC53F', color: '#F9F6F2' },
                2048: { bg: '#EDC22E', color: '#F9F6F2' }
            }
        }
    },
    neon: {
        id: 'neon',
        name: 'Неоновый',
        preview: '🎇',
        price: 500,
        priceStars: 25,
        enabled: true,
        description: 'Яркие неоновые цвета',
        styleConfig: {
            boardBackground: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
            boardBorder: 'rgba(120, 219, 255, 0.8)',
            tileBackground: 'rgba(30, 30, 50, 0.9)',
            tileBorder: 'rgba(120, 219, 255, 0.5)',
            glowEffect: '0 0 20px rgba(120, 219, 255, 0.6)',
            mergeEffect: 'neon_flash',
            tileColors: {
                2: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' },
                4: { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' },
                8: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' },
                16: { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff' },
                32: { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fff' },
                64: { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: '#fff' },
                128: { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' },
                256: { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: '#333' },
                512: { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' },
                1024: { bg: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', color: '#fff' },
                2048: { bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', color: '#fff' }
            }
        }
    },
    gold: {
        id: 'gold',
        name: 'Золотой',
        preview: '🪙',
        price: 1000,
        priceStars: 50,
        enabled: true,
        description: 'Роскошный золотой дизайн',
        styleConfig: {
            boardBackground: 'linear-gradient(135deg, #3d2814 0%, #5c4523 100%)',
            boardBorder: 'rgba(218, 165, 32, 0.9)',
            tileBackground: 'rgba(139, 69, 19, 0.8)',
            tileBorder: 'rgba(218, 165, 32, 0.7)',
            glowEffect: '0 0 15px rgba(255, 215, 0, 0.5)',
            mergeEffect: 'gold_shine',
            tileColors: {
                2: { bg: 'linear-gradient(135deg, #d4af37 0%, #f2d06b 100%)', color: '#5c4523' },
                4: { bg: 'linear-gradient(135deg, #daa520 0%, #ffd700 100%)', color: '#5c4523' },
                8: { bg: 'linear-gradient(135deg, #cd7f32 0%, #e5a73f 100%)', color: '#fff' },
                16: { bg: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)', color: '#fff' },
                32: { bg: 'linear-gradient(135deg, #8b6914 0%, #cd853f 100%)', color: '#fff' },
                64: { bg: 'linear-gradient(135deg, #704214 0%, #b8860b 100%)', color: '#fff' },
                128: { bg: 'linear-gradient(135deg, #ffdf00 0%, #ffef00 100%)', color: '#5c4523' },
                256: { bg: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', color: '#5c4523' },
                512: { bg: 'linear-gradient(135deg, #ffbf00 0%, #ffd700 100%)', color: '#5c4523' },
                1024: { bg: 'linear-gradient(135deg, #ff9500 0%, #ffb700 100%)', color: '#fff' },
                2048: { bg: 'linear-gradient(135deg, #ff6b00 0%, #ff8800 100%)', color: '#fff' }
            }
        }
    },
    space: {
        id: 'space',
        name: 'Космический',
        preview: '🌌',
        price: 1500,
        priceStars: 75,
        enabled: true,
        description: 'Темы космоса и звёзд',
        styleConfig: {
            boardBackground: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
            boardBorder: 'rgba(138, 43, 226, 0.8)',
            tileBackground: 'rgba(10, 10, 30, 0.9)',
            tileBorder: 'rgba(138, 43, 226, 0.6)',
            glowEffect: '0 0 25px rgba(138, 43, 226, 0.7)',
            mergeEffect: 'star_burst',
            tileColors: {
                2: { bg: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: '#fff' },
                4: { bg: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)', color: '#fff' },
                8: { bg: 'linear-gradient(135deg, #360033 0%, #0b8793 100%)', color: '#fff' },
                16: { bg: 'linear-gradient(135deg, #614385 0%, #516395 100%)', color: '#fff' },
                32: { bg: 'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)', color: '#fff' },
                64: { bg: 'linear-gradient(135deg, #6441a5 0%, #2a0845 100%)', color: '#fff' },
                128: { bg: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)', color: '#fff' },
                256: { bg: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)', color: '#fff' },
                512: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' },
                1024: { bg: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', color: '#fff' },
                2048: { bg: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)', color: '#fff' }
            }
        }
    },
    nature: {
        id: 'nature',
        name: 'Природный',
        preview: '🌿',
        price: 800,
        priceStars: 40,
        enabled: true,
        description: 'Естественные зелёные тона',
        styleConfig: {
            boardBackground: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%)',
            boardBorder: 'rgba(76, 175, 80, 0.8)',
            tileBackground: 'rgba(46, 125, 50, 0.7)',
            tileBorder: 'rgba(76, 175, 80, 0.6)',
            glowEffect: '0 0 15px rgba(76, 175, 80, 0.5)',
            mergeEffect: 'leaf_scatter',
            tileColors: {
                2: { bg: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', color: '#fff' },
                4: { bg: 'linear-gradient(135deg, #99f2c8 0%, #1f4037 100%)', color: '#fff' },
                8: { bg: 'linear-gradient(135deg, #c6ffdd 0%, #fbd786 0%, #f7797d 100%)', color: '#fff' },
                16: { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: '#fff' },
                32: { bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', color: '#fff' },
                64: { bg: 'linear-gradient(135deg, #0b486b 0%, #f56217 100%)', color: '#fff' },
                128: { bg: 'linear-gradient(135deg, #7de2fc 0%, #b9fbc0 100%)', color: '#333' },
                256: { bg: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)', color: '#333' },
                512: { bg: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)', color: '#fff' },
                1024: { bg: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)', color: '#fff' },
                2048: { bg: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', color: '#fff' }
            }
        }
    },
    fire: {
        id: 'fire',
        name: 'Огненный',
        preview: '🔥',
        price: 1200,
        priceStars: 60,
        enabled: true,
        description: 'Горячие красные оттенки',
        styleConfig: {
            boardBackground: 'linear-gradient(135deg, #2d0a00 0%, #4a0e00 100%)',
            boardBorder: 'rgba(255, 69, 0, 0.9)',
            tileBackground: 'rgba(139, 0, 0, 0.8)',
            tileBorder: 'rgba(255, 69, 0, 0.7)',
            glowEffect: '0 0 20px rgba(255, 69, 0, 0.8)',
            mergeEffect: 'fire_explosion',
            tileColors: {
                2: { bg: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', color: '#fff' },
                4: { bg: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)', color: '#fff' },
                8: { bg: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', color: '#fff' },
                16: { bg: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)', color: '#fff' },
                32: { bg: 'linear-gradient(135deg, #fe0000 0%, #fdcf58 100%)', color: '#fff' },
                64: { bg: 'linear-gradient(135deg, #ed213a 0%, #93291e 100%)', color: '#fff' },
                128: { bg: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)', color: '#fff' },
                256: { bg: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)', color: '#fff' },
                512: { bg: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', color: '#fff' },
                1024: { bg: 'linear-gradient(135deg, #d31027 0%, #ea384d 100%)', color: '#fff' },
                2048: { bg: 'linear-gradient(135deg, #c21500 0%, #ffc500 100%)', color: '#fff' }
            }
        }
    },
    ice: {
        id: 'ice',
        name: 'Ледяной',
        preview: '❄️',
        price: 900,
        priceStars: 45,
        enabled: true,
        description: 'Холодные синие тона',
        styleConfig: {
            boardBackground: 'linear-gradient(135deg, #0c1e2e 0%, #1a3a52 100%)',
            boardBorder: 'rgba(135, 206, 250, 0.9)',
            tileBackground: 'rgba(70, 130, 180, 0.7)',
            tileBorder: 'rgba(135, 206, 250, 0.6)',
            glowEffect: '0 0 20px rgba(135, 206, 250, 0.6)',
            mergeEffect: 'ice_shatter',
            tileColors: {
                2: { bg: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)', color: '#333' },
                4: { bg: 'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)', color: '#fff' },
                8: { bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', color: '#fff' },
                16: { bg: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)', color: '#fff' },
                32: { bg: 'linear-gradient(135deg, #0093e9 0%, #80d0c7 100%)', color: '#fff' },
                64: { bg: 'linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%)', color: '#fff' },
                128: { bg: 'linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%)', color: '#fff' },
                256: { bg: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', color: '#333' },
                512: { bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', color: '#333' },
                1024: { bg: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', color: '#333' },
                2048: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' }
            }
        }
    },
    rainbow: {
        id: 'rainbow',
        name: 'Радужный',
        preview: '🌈',
        price: 2000,
        priceStars: 100,
        enabled: true,
        description: 'Все цвета радуги',
        styleConfig: {
            boardBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            boardBorder: 'rgba(255, 255, 255, 0.8)',
            tileBackground: 'rgba(255, 255, 255, 0.2)',
            tileBorder: 'rgba(255, 255, 255, 0.5)',
            glowEffect: '0 0 25px rgba(255, 255, 255, 0.7)',
            mergeEffect: 'rainbow_burst',
            tileColors: {
                2: { bg: 'linear-gradient(135deg, #ff0000 0%, #ff7f00 100%)', color: '#fff' },
                4: { bg: 'linear-gradient(135deg, #ff7f00 0%, #ffff00 100%)', color: '#333' },
                8: { bg: 'linear-gradient(135deg, #ffff00 0%, #00ff00 100%)', color: '#333' },
                16: { bg: 'linear-gradient(135deg, #00ff00 0%, #0000ff 100%)', color: '#fff' },
                32: { bg: 'linear-gradient(135deg, #0000ff 0%, #4b0082 100%)', color: '#fff' },
                64: { bg: 'linear-gradient(135deg, #4b0082 0%, #9400d3 100%)', color: '#fff' },
                128: { bg: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)', color: '#fff' },
                256: { bg: 'linear-gradient(135deg, #00ced1 0%, #1e90ff 100%)', color: '#fff' },
                512: { bg: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)', color: '#333' },
                1024: { bg: 'linear-gradient(135deg, #7fff00 0%, #00fa9a 100%)', color: '#333' },
                2048: { bg: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)', color: '#fff' }
            }
        }
    }
};

// Пакеты скинов
const SKIN_PACKAGES = {
    elements: {
        id: 'elements',
        name: 'Стихии',
        preview: '🌊🔥🌿',
        skins: ['ice', 'fire', 'nature'],
        priceStars: 120,
        priceCoins: 2400,
        discount: 20 // процент скидки
    },
    cosmos: {
        id: 'cosmos',
        name: 'Космос',
        preview: '🌌🌈🎇',
        skins: ['space', 'rainbow', 'neon'],
        priceStars: 180,
        priceCoins: 3600,
        discount: 15
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.SKIN_CONFIGS = SKIN_CONFIGS;
    window.SKIN_PACKAGES = SKIN_PACKAGES;
}
