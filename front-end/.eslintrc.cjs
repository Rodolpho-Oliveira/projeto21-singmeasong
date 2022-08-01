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
        "import/prefer-default-export": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-filename-extension": "off",
        "react/prop-types": "off",
        "react/jsx-props-no-spreading": "off"
    }
};
