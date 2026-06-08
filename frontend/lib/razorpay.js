/**
 * Dynamically loads the Razorpay checkout script if it is not already loaded.
 * @returns {Promise<boolean>} Resolves to true if the script loaded successfully or is already loaded, otherwise false.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    
    // If Razorpay script is already present
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Helper to configure and open a Razorpay checkout window.
 * @param {Object} config Configuration options for the checkout
 * @returns {Promise<Object>} Resolves with the Razorpay response object, or rejects on dismissal or failure.
 */
export async function openRazorpayCheckout({
  keyId,
  amount,
  currency,
  name,
  description,
  image,
  orderId,
  prefill = {},
  themeColor = '#7C3AED',
  onSuccess,
  onCancel,
  onError
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount,
      currency,
      name: name || 'Nexora',
      description: description || '',
      image: image || '',
      order_id: orderId,
      handler: function (response) {
        if (onSuccess) onSuccess(response);
        resolve(response);
      },
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || ''
      },
      theme: {
        color: themeColor
      },
      modal: {
        ondismiss: function () {
          if (onCancel) onCancel();
          reject(new Error('Payment cancelled'));
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      if (onError) onError(err);
      reject(err);
    }
  });
}
