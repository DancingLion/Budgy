// Theme Type Definitions
export interface ThemeColors {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
        dark: string;
    };
    card: {
        primary: string;
        dark: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        dark: {
            primary: string;
            secondary: string;
        };
    };
    border: {
        light: string;
        medium: string;
        dark: string;
    };
    shadow: string;
    category: {
        food: string;
        shopping: string;
        transport: string;
        entertainment: string;
        utilities: string;
        other: string;
    };
}

export interface ThemeSpacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
}

export interface ThemeBorderRadius {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
}

export interface ThemeShadow {
    shadowColor: string;
    shadowOffset: {
        width: number;
        height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
}

export interface ThemeTypography {
    sizes: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    weights: {
        regular: string;
        medium: string;
        semibold: string;
        bold: string;
    };
}

export interface Theme {
    colors: ThemeColors;
    spacing: ThemeSpacing;
    borderRadius: ThemeBorderRadius;
    shadows: {
        sm: ThemeShadow;
        md: ThemeShadow;
        lg: ThemeShadow;
    };
    typography: ThemeTypography;
}

export const colors = {
    primary: '#007AFF',
    secondary: '#EC4899', // 핑크
    success: '#22C55E', // 초록색 (수입)
    danger: '#EF4444', // 빨간색 (지출)
    warning: '#F59E0B', // 주황색
    info: '#3B82F6', // 파란색

    // 배경색
    background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
        tertiary: '#E5E7EB',
        dark: '#000000'
    },

    // 카드 배경색
    card: {
        primary: '#FFFFFF',
        dark: '#1C1C1E'
    },

    // 텍스트 색상
    text: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
        dark: {
            primary: '#FFFFFF',
            secondary: '#AAAAAA'
        }
    },

    // 테두리 색상
    border: {
        light: '#E5E5E5',
        medium: '#D1D5DB',
        dark: '#333333'
    },

    // 그림자 색상
    shadow: '#000000',

    // 카테고리별 색상
    category: {
        food: '#FB923C', // 주황색
        shopping: '#EC4899', // 핑크
        transport: '#6366F1', // 인디고
        entertainment: '#8B5CF6', // 보라색
        utilities: '#10B981', // 초록색
        other: '#64748B' // 회색
    }
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 16,
    full: 9999
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 5,
    }
};

export const typography = {
    sizes: {
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
    }
};

const theme: Theme = {
    colors,
    spacing,
    borderRadius,
    shadows,
    typography
};

export default theme; 