import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { generateInvoiceHtml } from '@/lib/finance-engine';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = db.getInvoiceById(params.id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Authorization check
    if (user.role !== 'admin') {
      const isClient = invoice.customer.email === user.email || invoice.customer.name === user.name;
      const isFreelancer = invoice.customer.email === user.email || invoice.supplier.email === user.email;
      if (!isClient && !isFreelancer) {
        return NextResponse.json({ error: 'Forbidden: You do not have permission to view this invoice' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    // Return print-ready HTML page if requested
    if (format === 'html') {
      const html = generateInvoiceHtml(invoice);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }

    return NextResponse.json({
      success: true,
      invoice
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error retrieving invoice' }, { status: 500 });
  }
}
