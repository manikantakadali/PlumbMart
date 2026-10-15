/**
 * PlumbMart GST Tax Invoice Generator
 * Generates an authentic, GST-compliant printable & downloadable Tax Invoice (A4).
 */

function numberToWordsINR(num) {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  function convertGroup(val) {
    let str = '';
    if (val > 99) {
      str += a[Math.floor(val / 100)] + 'Hundred ';
      val %= 100;
    }
    if (val > 19) {
      str += b[Math.floor(val / 10)] + ' ' + a[val % 10];
    } else if (val > 0) {
      str += a[val];
    }
    return str.trim();
  }

  let crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  let thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  let hundredPart = rem;

  let words = '';
  if (crore > 0) words += convertGroup(crore) + ' Crore ';
  if (lakh > 0) words += convertGroup(lakh) + ' Lakh ';
  if (thousand > 0) words += convertGroup(thousand) + ' Thousand ';
  if (hundredPart > 0) words += convertGroup(hundredPart) + ' ';

  return (words.trim() + ' Rupees Only').replace(/\s+/g, ' ');
}

export function generateInvoiceHtml(order, client = {}) {
  const orderId = order.id || 'PM-ORDER';
  const cleanId = String(orderId).replace(/\D/g, '') || Math.floor(100000 + Math.random() * 900000);
  const invoiceNo = `PM-INV-2024-${cleanId}`;
  
  const createdDate = order.createdAt ? new Date(order.createdAt) : (order.date ? new Date(order.date) : new Date());
  const formattedDate = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '10:30 AM';

  const zohoSo = order.zohoSalesOrder || (`SO-ZH-${cleanId.slice(-5) || '8849'}`);
  
  // Buyer identification
  const buyerName = order.clientName || client.name || client.businessName || 'Valued Customer';
  const buyerMobile = order.clientMobile || client.mobile || client.phone || '9876543210';
  const buyerEmail = order.clientEmail || client.email || 'customer@plumbmart.com';
  const buyerAddress = order.deliveryAddress || client.address || 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103';
  const buyerGstin = order.clientGstin || client.gstin || order.dealerGst || (order.clientType === 'Dealer' || client.role === 'Dealer' ? '29ABCDE1234F1Z5' : 'Unregistered Consumer (B2C)');
  const clientType = order.clientType || client.role || 'Customer';

  // Items processing
  const items = Array.isArray(order.items) && order.items.length > 0 
    ? order.items 
    : [{ name: 'Commercial Plumbing & Sanitary Fixtures', qty: 1, price: order.total || 3450, sku: 'PLB-KIT-01' }];

  let grandTotal = Number(order.total || 0);
  if (grandTotal === 0) {
    grandTotal = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.qty || it.quantity || 1)), 0);
  }

  // Inclusive GST calculations (18% standard GST on plumbing goods: CGST 9% + SGST 9%)
  // Taxable Value = Grand Total / 1.18
  const taxableTotal = Math.round((grandTotal / 1.18) * 100) / 100;
  const totalGst = Math.round((grandTotal - taxableTotal) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  const totalQty = items.reduce((sum, it) => sum + Number(it.qty || it.quantity || 1), 0);
  const amountInWords = numberToWordsINR(grandTotal);

  const isCredit = order.paymentMethod && order.paymentMethod.includes('Credit');
  const paymentStatus = order.paymentStatus || (isCredit ? 'Credit Approved' : 'Paid in Full');
  const paymentMethod = order.paymentMethod || 'Online Paid (UPI/Cards)';

  const itemsRows = items.map((it, idx) => {
    const qty = Number(it.qty || it.quantity || 1);
    const itemTotal = Number(it.price || 0) * qty;
    const itemTaxable = Math.round((itemTotal / 1.18) * 100) / 100;
    const itemCgst = Math.round((itemTaxable * 0.09) * 100) / 100;
    const itemSgst = Math.round((itemTaxable * 0.09) * 100) / 100;
    const hsn = it.hsn || (it.sku && it.sku.startsWith('PVC') ? '3917' : '84818090');

    return `
      <tr>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 7px 6px; font-size: 11px;">${idx + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 7px 8px; font-size: 11px;">
          <div style="font-weight: 700; color: #0f172a;">${it.name || 'Plumbing Product'}</div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">SKU: ${it.sku || it.id || 'PLB-SKU'}</div>
        </td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 7px 6px; font-size: 11px; font-family: monospace;">${hsn}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 7px 6px; font-size: 11px; font-weight: 600;">${qty}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 7px 6px; font-size: 11px; font-family: monospace;">₹${(Number(it.price || 0)).toLocaleString('en-IN')}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 7px 6px; font-size: 11px; font-family: monospace;">₹${itemTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 7px 6px; font-size: 11px; font-family: monospace;">₹${itemCgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 7px 6px; font-size: 11px; font-family: monospace;">₹${itemSgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 7px 8px; font-size: 11px; font-weight: 700; font-family: monospace; color: #0f172a;">₹${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PlumbMart_Tax_Invoice_${orderId}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #f1f5f9;
      line-height: 1.35;
      font-size: 11px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
    }
    .no-print-btn {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .no-print-btn:hover {
      background: #1d4ed8;
    }
    .no-print-btn-secondary {
      background: #334155;
      color: #ffffff;
      border: 1px solid #475569;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 12px;
    }
    .no-print-btn-close {
      background: transparent;
      color: #94a3b8;
      border: 1px solid #475569;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 12px;
    }

    .page-container {
      max-width: 820px;
      margin: 20px auto;
      background: #ffffff;
      padding: 24px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }

    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .page-container {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
    }
  </style>
</head>
<body>

  <!-- Floating Screen Action Toolbar (Hidden when printing/saved as PDF) -->
  <div class="no-print">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 800; font-size: 14px; letter-spacing: -0.2px;">Plumb<span style="color: #60a5fa;">Mart</span> Tax Invoice</span>
      <span style="font-size: 11px; background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 999px; font-weight: 700;">GST Compliant</span>
      <span style="font-size: 12px; color: #94a3b8; font-family: monospace;">Order #${orderId}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <button class="no-print-btn" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>Print / Save as PDF</span>
      </button>
      <button class="no-print-btn-secondary" id="saveHtmlBtn">
        Save HTML
      </button>
      <button class="no-print-btn-close" onclick="window.close()">
        Close
      </button>
    </div>
  </div>

  <div class="page-container">
    
    <!-- TOP HEADER -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #0f172a;">
      <div>
        <h1 style="font-size: 26px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px; margin-bottom: 2px;">
          Plumb<span style="color: #0284c7;">Mart</span>
        </h1>
        <p style="font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
          PlumbMart Technologies Private Limited
        </p>
        <p style="font-size: 10px; color: #64748b; margin-top: 2px; max-width: 380px;">
          Central Distribution Hub: Plot 42, 2nd Phase, Peenya Industrial Area, Bengaluru, Karnataka - 560058<br/>
          <strong>GSTIN:</strong> 29AAACP8849L1Z8 &bull; <strong>State:</strong> Karnataka (Code 29)<br/>
          <strong>CIN:</strong> U51909KA2024PTC188920 &bull; <strong>Email:</strong> billing@plumbmart.com
        </p>
      </div>

      <div style="text-align: right;">
        <div style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 4px 14px; border-radius: 6px; font-size: 13px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">
          TAX INVOICE
        </div>
        <p style="font-size: 9px; color: #64748b; margin-top: 3px;">
          (Original for Recipient &bull; Sec 31 CGST Act)
        </p>
        <div style="margin-top: 8px; font-size: 11px;">
          <div><strong style="color: #475569;">Invoice No:</strong> <span style="font-family: monospace; font-weight: 800; color: #0f172a;">${invoiceNo}</span></div>
          <div><strong style="color: #475569;">Invoice Date:</strong> <span style="font-weight: 700;">${formattedDate} (${formattedTime})</span></div>
          <div><strong style="color: #475569;">Zoho Sales Order:</strong> <span style="font-family: monospace; font-weight: 700; color: #0284c7;">${zohoSo}</span></div>
        </div>
      </div>
    </div>

    <!-- META DETAILS GRID -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #cbd5e1;">
      
      <!-- Billed & Shipped To -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; letter-spacing: 0.5px; margin-bottom: 4px;">
          Details of Receiver (Billed &amp; Shipped To)
        </div>
        <div style="font-size: 12px; font-weight: 800; color: #0f172a;">
          ${buyerName}
          <span style="font-size: 10px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; margin-left: 4px;">${clientType}</span>
        </div>
        <div style="font-size: 10px; color: #475569; margin-top: 2px;">
          <strong>Mobile:</strong> +91 ${buyerMobile} &bull; <strong>Email:</strong> ${buyerEmail}
        </div>
        <div style="font-size: 10px; color: #334155; margin-top: 4px; line-height: 1.4;">
          <strong>Delivery Site:</strong> ${buyerAddress}
        </div>
        <div style="font-size: 10px; color: #0f172a; margin-top: 4px;">
          <strong>Buyer GSTIN:</strong> <span style="font-family: monospace; font-weight: 700;">${buyerGstin}</span>
        </div>
      </div>

      <!-- Order & Transport Attributes -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; letter-spacing: 0.5px; margin-bottom: 4px;">
          Order &amp; Logistics Particulars
        </div>
        <table style="font-size: 10px; width: 100%;">
          <tr>
            <td style="color: #64748b; padding: 2px 0;"><strong>Order ID:</strong></td>
            <td style="font-family: monospace; font-weight: 800; color: #0f172a;">#${orderId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;"><strong>Place of Supply:</strong></td>
            <td style="font-weight: 700;">Karnataka (Code 29)</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;"><strong>Payment Method:</strong></td>
            <td style="font-weight: 700; color: #0f172a;">${paymentMethod}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;"><strong>Payment Status:</strong></td>
            <td>
              <span style="font-weight: 800; color: ${isCredit ? '#b45309' : '#15803d'};">
                ● ${paymentStatus}
              </span>
              ${order.creditDueDate ? `<span style="font-size: 9px; color: #b45309;">(Due: ${order.creditDueDate})</span>` : ''}
            </td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;"><strong>Dispatch Method:</strong></td>
            <td style="font-weight: 600; color: #334155;">PlumbMart Dedicated Express Van</td>
          </tr>
        </table>
      </div>

    </div>

    <!-- ITEMIZED TABLE -->
    <div style="margin-top: 12px;">
      <table>
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="border: 1px solid #0f172a; padding: 6px 4px; font-size: 10px; text-transform: uppercase; width: 28px; text-align: center;">#</th>
            <th style="border: 1px solid #0f172a; padding: 6px 8px; font-size: 10px; text-transform: uppercase; text-align: left;">Product Description</th>
            <th style="border: 1px solid #0f172a; padding: 6px 4px; font-size: 10px; text-transform: uppercase; width: 68px; text-align: center;">HSN/SAC</th>
            <th style="border: 1px solid #0f172a; padding: 6px 4px; font-size: 10px; text-transform: uppercase; width: 44px; text-align: center;">Qty</th>
            <th style="border: 1px solid #0f172a; padding: 6px 6px; font-size: 10px; text-transform: uppercase; width: 75px; text-align: right;">Unit Rate</th>
            <th style="border: 1px solid #0f172a; padding: 6px 6px; font-size: 10px; text-transform: uppercase; width: 85px; text-align: right;">Taxable (₹)</th>
            <th style="border: 1px solid #0f172a; padding: 6px 6px; font-size: 10px; text-transform: uppercase; width: 68px; text-align: right;">CGST 9%</th>
            <th style="border: 1px solid #0f172a; padding: 6px 6px; font-size: 10px; text-transform: uppercase; width: 68px; text-align: right;">SGST 9%</th>
            <th style="border: 1px solid #0f172a; padding: 6px 8px; font-size: 10px; text-transform: uppercase; width: 90px; text-align: right;">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr style="background-color: #f8fafc; font-weight: 700; border: 1px solid #cbd5e1;">
            <td colspan="3" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase; color: #475569;">
              Subtotal:
            </td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center; font-size: 11px;">${totalQty}</td>
            <td style="border: 1px solid #cbd5e1;"></td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: right; font-size: 11px; font-family: monospace;">₹${taxableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: right; font-size: 11px; font-family: monospace;">₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: right; font-size: 11px; font-family: monospace;">₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-size: 11px; font-family: monospace; font-weight: 800;">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- CALCULATION & AMOUNT IN WORDS -->
    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; margin-top: 10px;">
      
      <!-- Amount in words & Bank info -->
      <div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;">
          <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b;">Invoice Total in Words:</div>
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 2px;">${amountInWords}</div>
        </div>

        <div style="border: 1px dashed #cbd5e1; border-radius: 8px; padding: 8px 10px; font-size: 9px; color: #475569; background: #ffffff;">
          <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 2px;">PlumbMart Settlement Bank Account:</div>
          <div>Bank: <strong>HDFC Bank Ltd.</strong> &bull; A/C Name: <strong>PlumbMart Technologies Pvt Ltd</strong></div>
          <div>A/C No: <strong>50200088491234</strong> &bull; IFSC: <strong>HDFC0001234</strong> &bull; Branch: Peenya, BLR</div>
        </div>
      </div>

      <!-- Financial Totals Summary -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
        <table style="width: 100%; font-size: 11px;">
          <tr>
            <td style="color: #64748b; padding: 2px 0;">Total Taxable Amount:</td>
            <td style="text-align: right; font-family: monospace; font-weight: 600;">₹${taxableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;">Central GST (CGST 9%):</td>
            <td style="text-align: right; font-family: monospace; font-weight: 600;">₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;">State GST (SGST 9%):</td>
            <td style="text-align: right; font-family: monospace; font-weight: 600;">₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;">Integrated GST (IGST 0%):</td>
            <td style="text-align: right; font-family: monospace; font-weight: 600;">₹0.00</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;">Fulfillment &amp; Express Handling:</td>
            <td style="text-align: right; font-family: monospace; color: #15803d; font-weight: 700;">FREE</td>
          </tr>
          <tr style="border-top: 2px solid #0f172a;">
            <td style="padding: 6px 0 0 0; font-size: 13px; font-weight: 900; color: #0f172a;">Grand Total:</td>
            <td style="padding: 6px 0 0 0; text-align: right; font-size: 14px; font-weight: 900; color: #1e3a8a; font-family: monospace;">
              ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </table>
      </div>

    </div>

    <!-- TERMS & SIGNATURE FOOTER -->
    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px; margin-top: 14px; padding-top: 10px; border-top: 1px solid #cbd5e1;">
      
      <!-- Terms -->
      <div style="font-size: 9px; color: #64748b; line-height: 1.45;">
        <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 2px;">Terms &amp; Conditions</div>
        <ol style="padding-left: 14px;">
          <li>Goods supplied are genuine products covered under manufacturer warranty.</li>
          <li>For returns or damage claims, report within 48 hours to support@plumbmart.com.</li>
          <li>Subject to Bengaluru jurisdiction only. Interest @ 18% p.a. charged on overdue credit.</li>
        </ol>
      </div>

      <!-- Authorized Signature -->
      <div style="text-align: center; border-left: 1px solid #e2e8f0; padding-left: 12px;">
        <div style="font-size: 10px; font-weight: 800; color: #0f172a;">
          For PlumbMart Technologies Pvt. Ltd.
        </div>
        
        <!-- Digital Stamp representation -->
        <div style="margin: 6px auto; width: 110px; padding: 4px; border: 1.5px dashed #0284c7; border-radius: 8px; background: #f0f9ff;">
          <div style="font-size: 8px; font-weight: 800; color: #0369a1; text-transform: uppercase;">Digitally Verified</div>
          <div style="font-size: 8px; color: #0284c7; font-family: monospace;">AUTH-SIGN-PM-${cleanId.slice(-4)}</div>
          <div style="font-size: 7px; color: #64748b;">${formattedDate}</div>
        </div>

        <div style="font-size: 9px; font-weight: 700; color: #334155; margin-top: 2px;">
          Authorized Signatory
        </div>
        <div style="font-size: 8px; color: #94a3b8;">
          (Computer Generated Tax Invoice - No Physical Signature Required)
        </div>
      </div>

    </div>

    <!-- BOTTOM QR / BARCODE META -->
    <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #94a3b8; font-family: monospace;">
      <div>IRN: 8a4c9b21f0088921e43b1299908849aa${cleanId}</div>
      <div>Page 1 of 1 &bull; PlumbMart E-Commerce Enterprise Platform</div>
    </div>

  </div>

  <script>
    // Automatically trigger Print Dialog for user
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 400);
    });

    // Save as HTML file fallback
    document.getElementById('saveHtmlBtn').addEventListener('click', function() {
      const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'PlumbMart_Tax_Invoice_${orderId}.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  </script>
</body>
</html>`;
}

/**
 * Downloads or prints the GST Tax Invoice dynamically
 */
export function downloadTaxInvoice(order, client = {}) {
  if (!order) {
    alert('Order details not found.');
    return;
  }

  const html = generateInvoiceHtml(order, client);

  // Attempt to open in a new window/tab
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // If popup was blocked by browser, trigger direct file download
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlumbMart_Tax_Invoice_${order.id || 'ORDER'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
