module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "cypress/globals": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:cypress/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": false,
            "experimentalObjectRestSpread": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module",
        
    },
    "plugins": [
        "react",
        "cypress",
    ],
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["error", "double"],
        "jest/expect-expect": "off"
    }
};
