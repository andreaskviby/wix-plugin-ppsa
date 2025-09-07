import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThankYouSurvey from '../src/widgets/thankyou-survey/ThankYouSurvey.jsx';

// Mock backend functions
jest.mock('../src/backend/responses.jsw', () => ({
  saveResponse: jest.fn(),
  responseExists: jest.fn()
}));

const mockSaveResponse = require('../src/backend/responses.jsw').saveResponse;
const mockResponseExists = require('../src/backend/responses.jsw').responseExists;

// Mock analytics functions
window.gtag = jest.fn();
window.fbq = jest.fn();
window.dataLayer = [];

describe('ThankYouSurvey Widget', () => {
  const defaultProps = {
    orderId: 'order-123',
    orderValue: 100,
    currency: 'USD',
    settings: {
      surveyTitle: 'How did you hear about us?',
      choices: ['Instagram', 'Facebook', 'Google', 'Other']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponseExists.mockResolvedValue(false);
    mockSaveResponse.mockResolvedValue({
      success: true,
      duplicate: false
    });
  });

  it('should render survey when orderId is provided', async () => {
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('How did you hear about us?')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should not render when no orderId provided', () => {
    render(<ThankYouSurvey {...defaultProps} orderId={null} />);
    
    expect(screen.queryByText('How did you hear about us?')).not.toBeInTheDocument();
  });

  it('should show success message when response already exists', async () => {
    mockResponseExists.mockResolvedValue(true);
    
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Thank you!')).toBeInTheDocument();
    });
  });

  it('should handle channel selection', async () => {
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });
    
    const instagramRadio = screen.getByLabelText('Instagram');
    fireEvent.click(instagramRadio);
    
    expect(instagramRadio).toBeChecked();
  });

  it('should show other text input when Other is selected', async () => {
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });
    
    const otherRadio = screen.getByLabelText('Other');
    fireEvent.click(otherRadio);
    
    expect(screen.getByPlaceholderText('Please specify...')).toBeInTheDocument();
  });

  it('should validate required fields before submission', async () => {
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please select how you heard about us')).toBeInTheDocument();
    expect(mockSaveResponse).not.toHaveBeenCalled();
  });

  it('should validate Other text input', async () => {
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });
    
    const otherRadio = screen.getByLabelText('Other');
    fireEvent.click(otherRadio);
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please specify how you heard about us')).toBeInTheDocument();
  });

  it('should submit valid response', async () => {
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });
    
    const instagramRadio = screen.getByLabelText('Instagram');
    fireEvent.click(instagramRadio);
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSaveResponse).toHaveBeenCalledWith({
        orderId: 'order-123',
        channel: 'Instagram',
        otherText: null,
        clientHints: expect.any(Object)
      });
    });
  });

  it('should show success message after submission', async () => {
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });
    
    const instagramRadio = screen.getByLabelText('Instagram');
    fireEvent.click(instagramRadio);
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Thank you!')).toBeInTheDocument();
      expect(screen.getByText('Your feedback helps us serve you better.')).toBeInTheDocument();
    });
  });

  it('should handle submission errors', async () => {
    mockSaveResponse.mockResolvedValue({
      success: false,
      error: 'Network error'
    });
    
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });
    
    const instagramRadio = screen.getByLabelText('Instagram');
    fireEvent.click(instagramRadio);
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to submit response. Please try again.')).toBeInTheDocument();
    });
  });

  it('should fire analytics events on successful submission', async () => {
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });
    
    const instagramRadio = screen.getByLabelText('Instagram');
    fireEvent.click(instagramRadio);
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Thank you!')).toBeInTheDocument();
    });
    
    // Check that analytics functions were called
    expect(window.gtag).toHaveBeenCalledWith('event', 'HDYHAU', {
      channel: 'Instagram',
      order_value: 100,
      currency: 'USD',
      order_id: 'order-123'
    });
    
    expect(window.fbq).toHaveBeenCalledWith('trackCustom', 'HDYHAU', {
      channel: 'Instagram',
      value: 100,
      currency: 'USD'
    });
  });

  it('should disable form during submission', async () => {
    // Mock a delayed response
    mockSaveResponse.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );
    
    render(<ThankYouSurvey {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });
    
    const instagramRadio = screen.getByLabelText('Instagram');
    fireEvent.click(instagramRadio);
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    // Form should be disabled during submission
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(instagramRadio).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should show consent text when enabled', async () => {
    const propsWithConsent = {
      ...defaultProps,
      settings: {
        ...defaultProps.settings,
        consentSettings: {
          showConsent: true
        }
      }
    };
    
    render(<ThankYouSurvey {...propsWithConsent} />);
    
    await waitFor(() => {
      expect(screen.getByText(/By submitting this survey, you agree/)).toBeInTheDocument();
    });
  });
});