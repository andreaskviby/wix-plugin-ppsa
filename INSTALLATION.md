# Wix App Installation Guide

## Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/andreaskviby/wix-plugin-ppsa.git
   cd wix-plugin-ppsa
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Install Wix CLI (if not already installed)**
   ```bash
   npm install -g @wix/cli
   ```

4. **Login to Wix**
   ```bash
   wix login
   ```

5. **Initialize Development Environment**
   ```bash
   wix dev
   ```

6. **Deploy to Wix**
   ```bash
   wix publish
   ```

## Configuration

The app will automatically:
- Create required database collections (`pps_responses`, `pps_settings`)
- Set up default survey configuration
- Register eCommerce event handlers
- Configure thank-you page widget placement

## Verification

After installation, verify:
1. Collections are created in Wix Data
2. Widget appears on thank-you pages
3. Dashboard is accessible via app menu
4. Settings can be configured

## Troubleshooting

Common issues:
- Ensure Wix Stores is enabled
- Check app permissions are granted
- Verify secret keys are configured (if using integrations)

For support, see the SETUP.md file for detailed configuration instructions.