import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { FreelancerSearchFilters } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('query') || undefined;
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const skill = searchParams.get('skill') || undefined;
    const skillsParam = searchParams.get('skills');
    const skills = skillsParam ? skillsParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const minPriceINR = searchParams.get('minPriceINR') ? Number(searchParams.get('minPriceINR')) : undefined;
    const maxPriceINR = searchParams.get('maxPriceINR') ? Number(searchParams.get('maxPriceINR')) : undefined;
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
    const deliveryDays = searchParams.get('deliveryDays') ? Number(searchParams.get('deliveryDays')) : undefined;
    const availability = searchParams.get('availability') || undefined;
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true' || searchParams.get('verified') === 'true';
    const experienceLevel = searchParams.get('experienceLevel') as any;
    const sortBy = (searchParams.get('sortBy') as any) || 'recommended';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 24;

    const filters: FreelancerSearchFilters = {
      query,
      category,
      subcategory,
      skill,
      skills,
      minPriceINR,
      maxPriceINR,
      minRating,
      deliveryDays,
      availability,
      verifiedOnly,
      experienceLevel,
      sortBy,
      page,
      limit
    };

    const result = db.searchFreelancers(filters);

    return NextResponse.json({
      freelancers: result.freelancers,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      category: result.category,
      matchedSubcategory: result.matchedSubcategory
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
