import React, { useState } from 'react';

const PaymentSimulator = ({ flight, selectedCurrency }) => {
  const [step, setStep] = useState('selection');

  const handleRedirectToPayment = () => {
    // الانتقال المباشر لصفحة الدفع التي أنشأتها
    window.location.href = 'payment-demo.html';
  };

  return (
    <div className="payment-container" style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', background: '#fff' }}>
      {step === 'selection' && (
        <>
          {/* تأكد من أن الكائن flight يحتوي على الهيكل الصحيح للأسعار */}
          <h4>إجمالي المبلغ: {flight?.price?.toLocaleString() || flight?.prices?.[selectedCurrency]} {selectedCurrency}</h4>
          <p>اختر وسيلة الدفع (التجريبية):</p>
          
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button 
              onClick={handleRedirectToPayment} 
              className="button button-primary" 
              style={{ background: '#e74c3c', border: 'none', color: 'white', padding: '12px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ادفع الآن عبر (بنكك)
            </button>
            
            <button 
              onClick={handleRedirectToPayment} 
              className="button" 
              style={{ background: '#3498db', border: 'none', color: 'white', padding: '12px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              بطاقة ماستركارد / فيزا
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSimulator;