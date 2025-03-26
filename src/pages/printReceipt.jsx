// printReceipt.js
export const printReceipt = (receiptData) => {
    if (!receiptData.policy || !receiptData.policy.amount) {
      alert("Invalid policy data for printing");
      return;
    }
  
    // Ensure values are numbers
    const amount = Number(receiptData.policy.amount) || 0;
    const taxAmount = Number(receiptData.taxAmount) || 0;
    const totalAmount = Number(receiptData.totalAmount) || 0;
  
    // Create and play a beep sound during printing
    const printSound = new Audio('/beep.mp3');
    printSound.loop = true;
    printSound.play().catch(err => console.error("Print sound error:", err));
  
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${receiptData.policy.policyNumber}</title>
          <style>
            @media print {
              body { width: 80mm; margin: 0; padding: 4mm; font-family: monospace; font-size: 12px; }
              .header { text-align: center; margin-bottom: 8px; }
              .divider { border-top: 1px dashed #000; margin: 8px 0; }
              table { width: 100%; border-collapse: collapse; margin: 8px 0; }
              td { padding: 2px 0; }
              .right { text-align: right; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
            }
            body { width: 80mm; margin: auto; padding: 4mm; font-family: monospace; font-size: 12px; color: #333; }
            .header { text-align: center; margin-bottom: 10px; }
            .header h2 { margin: 0; font-size: 16px; color: #1a365d; }
            .subheader { text-align: center; font-size: 12px; margin-bottom: 5px; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; margin-bottom: 8px; }
            td { padding: 4px 0; }
            .barcode { text-align: center; margin-top: 8px; }
            .barcode img { max-width: 100%; }
            .footer { text-align: center; margin-top: 10px; font-size: 10px; color: #555; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>WELT TALLIS INSURANCE</h2>
            <div class="subheader">123 Business Street, Nairobi<br>Tel: +254740045355</div>
            <div class="divider"></div>
          </div>
          <table>
            <tr><td colspan="2" class="center bold">INSURANCE RECEIPT</td></tr>
            <tr><td>Policy No:</td><td class="right bold">${receiptData.policy.policyNumber}</td></tr>
            <tr><td>Date:</td><td class="right">${new Date().toLocaleString()}</td></tr>
            <tr><td>Type:</td><td class="right">${receiptData.policy.type}</td></tr>
            <tr><td>Provider:</td><td class="right">${receiptData.policy.insuranceProvider}</td></tr>
            <tr class="divider"><td colspan="2"></td></tr>
            <tr><td>Amount:</td><td class="right">KES ${amount.toFixed(2)}</td></tr>
            <tr><td>Tax (16%):</td><td class="right">KES ${taxAmount.toFixed(2)}</td></tr>
            <tr class="bold"><td>TOTAL:</td><td class="right">KES ${totalAmount.toFixed(2)}</td></tr>
          </table>
          <div class="divider"></div>
          <div class="barcode">
            <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${receiptData.policy.policyNumber}&scale=2&height=20" alt="Barcode" />
            <div class="center bold">${receiptData.policy.policyNumber}</div>
          </div>
          <div class="footer">
            <div>Thank you for your business!</div>
            <div>We integrate: MPESA, Email, SMS, WhatsApp</div>
            <div>Call us: +254740045355</div>
          </div>
        </body>
      </html>
    `;
  
    const printWindow = window.open('', '_blank', 'width=440,height=500');
    printWindow.document.write(printContent);
    printWindow.document.close();
  
    printWindow.document.fonts.ready.then(() => {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          printSound.pause();
          printSound.currentTime = 0;
        }, 1000);
      }, 500);
    }).catch(error => {
      console.error('Print failed:', error);
      printSound.pause();
      printSound.currentTime = 0;
      Swal.fire('Error', 'Failed to print receipt', 'error');
    });
  };
  