import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type Language = 'bn' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  formatNumber: (num: number | string) => string;
  formatPrice: (amount: number) => string;
  translateCategory: (nameOrId: string) => string;
  translateProductName: (product: { name?: string; bengaliName?: string } | null | undefined) => string;
  translateColor: (colorName: string) => string;
  translateSize: (size: string) => string;
  translateStatus: (status: string) => string;
  translateDistrict: (district: string) => string;
  isBangla: boolean;
  isEnglish: boolean;
}

const BENGALI_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const CATEGORY_MAP: Record<string, string> = {
  'রেডিমেড থ্রিপিস.টু পিস': 'Readymade 3-Piece & 2-Piece',
  'রেডিমেড থ্রি-পিস': 'Readymade Three-Piece',
  'আনস্টিজ থ্রিপিস': 'Unstitched Three-Piece',
  'গাউন & কুর্তি': 'Gowns & Kurtis',
  'লেহেঙ্গা & পার্টি': 'Lehengas & Party Wear',
  'ওয়েস্টার্ন ড্রেস': 'Western Dresses',
  'টিশার্ট & স্কার্ট': 'T-Shirts & Skirts',
  'ইনার & নাইটি': 'Innerwear & Nighties',
  'শাড়ি': 'Sarees',
  'হ্যান্ডপ্রিন্ট শাড়ি': 'Handprint Sarees',
  'ইন্ডিয়ান শাড়ী': 'Indian Sarees',
  'সুতি শাড়ী': 'Cotton Sarees',
  'মসলিন শাড়ী': 'Muslin Sarees',
  'সিল্ক শাড়ী': 'Silk Sarees',
  'অরগাঞ্জা শাড়ী': 'Organza Sarees',
  'ব্র্যান্ডেড পোশাক': 'Branded Dresses',
  'বাচ্চাদের পোশাক': 'Kids Wear',
  'সবগুলো কালেকশন': 'All Collections',
  'সকল কালেকশন': 'All Collections',
  'all': 'All Collections',
  'three_piece': 'Three-Piece',
  'saree': 'Sarees',
  'kurti': 'Kurtis',
  'gown': 'Gowns',
  'lehenga': 'Lehengas',
  'western': 'Western Wear',
};

const COLOR_MAP: Record<string, string> = {
  'লাল': 'Red',
  'নীল': 'Blue',
  'কালো': 'Black',
  'সাদা': 'White',
  'গোলাপি': 'Pink',
  'সবুজ': 'Green',
  'হলুদ': 'Yellow',
  'মেরুন': 'Maroon',
  'বেগুনি': 'Purple',
  'আকাশি': 'Sky Blue',
  'কমলা': 'Orange',
  'অলিভ': 'Olive',
  'গোল্ডেন': 'Golden',
  'গ্রে': 'Grey',
  'অফ হোয়াইট': 'Off White',
  'ম্যাজেন্টা': 'Magenta',
  'নেভি ব্লু': 'Navy Blue',
  'টিয়া': 'Parrot Green',
  'পেস্ট': 'Paste',
  'ডিফল্ট': 'Default',
};

const STATUS_MAP: Record<string, { bn: string; en: string }> = {
  pending: { bn: 'অপেক্ষমান (Pending)', en: 'Pending' },
  confirmed: { bn: 'কনফার্মড (Confirmed)', en: 'Confirmed' },
  processing: { bn: 'প্রসেসিং (Processing)', en: 'Processing' },
  shipped: { bn: 'কুরিয়ারে হস্তান্তর (Shipped)', en: 'Shipped' },
  delivered: { bn: 'ডেলিভারি সম্পন্ন (Delivered)', en: 'Delivered' },
  cancelled: { bn: 'বাতিল (Cancelled)', en: 'Cancelled' },
};

const DISTRICT_MAP: Record<string, string> = {
  'ঢাকা': 'Dhaka',
  'চট্টগ্রাম': 'Chittagong',
  'সিলেট': 'Sylhet',
  'রাজশাহী': 'Rajshahi',
  'খুলনা': 'Khulna',
  'বরিশাল': 'Barisal',
  'রংপুর': 'Rangpur',
  'ময়মনসিংহ': 'Mymensingh',
  'গাজীপুর': 'Gazipur',
  'নারায়ণগঞ্জ': 'Narayanganj',
  'কুমিল্লা': 'Cumilla',
  'বগুড়া': 'Bogura',
  'কক্সবাজার': "Cox's Bazar",
  'ব্রাহ্মণবাড়িয়া': 'Brahmanbaria',
  'যশোর': 'Jashore',
  'টাঙ্গাইল': 'Tangail',
  'দিনাজপুর': 'Dinajpur',
  'নোয়াখালী': 'Noakhali',
  'ফেনী': 'Feni',
  'পাবনা': 'Pabna',
  'কুষ্টিয়া': 'Kushtia',
  'ফরিদপুর': 'Faridpur',
  'জামালপুর': 'Jamalpur',
  'কিশোরগঞ্জ': 'Kishoreganj',
  'সিরাজগঞ্জ': 'Sirajganj',
  'নেত্রকোণা': 'Netrokona',
  'হবিগঞ্জ': 'Habiganj',
  'মৌলভীবাজার': 'Moulvibazar',
  'সুনামগঞ্জ': 'Sunamganj',
  'নরসিংদী': 'Narsingdi',
  'মুন্সীগঞ্জ': 'Munshiganj',
  'মানিকগঞ্জ': 'Manikganj',
  'মাদারীপুর': 'Madaripur',
  'শরীয়তপুর': 'Shariatpur',
  'রাজবাড়ী': 'Rajbari',
  'গোপালগঞ্জ': 'Gopalganj',
  'চাঁদপুর': 'Chandpur',
  'লক্ষ্মীপুর': 'Lakshmipur',
  'রাঙ্গামাটি': 'Rangamati',
  'বান্দরবান': 'Bandarban',
  'খাগড়াছড়ি': 'Khagrachhari',
  'চাঁপাইনবাবগঞ্জ': 'Chapainawabganj',
  'নওগাঁ': 'Naogaon',
  'নাটোর': 'Natore',
  'জয়পুরহাট': 'Joypurhat',
  'বাগেরহাট': 'Bagerhat',
  'চুয়াডাঙ্গা': 'Chuadanga',
  'ঝিনাইদহ': 'Jhenaidah',
  'মাগুরা': 'Magura',
  'মেহেরপুর': 'Meherpur',
  'নড়াইল': 'Narail',
  'সাতক্ষীরা': 'Satkhira',
  'পিরোজপুর': 'Pirojpur',
  'ঝালকাঠি': 'Jhalokati',
  'পটুয়াখালী': 'Patuakhali',
  'বরগুনা': 'Barguna',
  'ভোলা': 'Bhola',
  'কুড়িগ্রাম': 'Kurigram',
  'গাইবান্ধা': 'Gaibandha',
  'লালমনিরহাট': 'Lalmonirhat',
  'নীলফামারী': 'Nilphamari',
  'পঞ্চগড়': 'Panchagarh',
  'ঠাকুরগাঁও': 'Thakurgaon',
  'শেরপুর': 'Sherpur'
};

export const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Brand & Header
    'brand.name': 'নারীর স্বপ্ন',
    'brand.tagline': "Women's Fashion",
    'brand.slogan': 'Dress Your Dreams',
    'nav.home': 'হোম',
    'nav.all_collections': 'সব কালেকশন',
    'nav.categories': 'ক্যাটাগরি',
    'nav.profile': 'প্রোফাইল',
    'nav.wishlist': 'উইশলিস্ট',
    'nav.admin': 'এডমিন',
    'nav.cart': 'কার্ট',
    'nav.track_order': 'অর্ডার ট্র্যাক',
    'nav.delivery_info': 'ডেলিভারি তথ্য',
    'nav.search_placeholder': 'থ্রি-পিস, শাড়ি, কুর্তি, গাউন বা প্রোডাক্ট সার্চ করুন...',
    'nav.live': 'লাইভ',
    'nav.clear_search': 'মুছে ফেলুন',
    'nav.search_results': 'সার্চ ফলাফল',
    'nav.popular_searches': 'জনপ্রিয় সার্চ',
    'nav.view_all_results': 'সকল ফলাফল দেখুন',
    'nav.no_search_results': 'দিয়ে কোনো পণ্য পাওয়া যায়নি',
    'nav.language_switch': 'English',

    // Announcement
    'announcement.text': '🌸 নারীর স্বপ্ন - উইমেন্স ফ্যাশনে আপনাকে স্বাগতম! সারাদেশে ক্যাশ অন ডেলিভারি, যেকোনো ৩টি পোশাকে এবং ৩,০০০+ টাকার অর্ডারে ফ্রি ডেলিভারি! 🌸',

    // Hero & Story
    'hero.badge': 'এক্সক্লুসিভ উইমেন্স ফ্যাশন ২০২৬',
    'hero.headline': 'ঐতিহ্য আর আধুনিকতার মেলবন্ধনে আপনার স্বপ্নের সাজ',
    'hero.subheadline': 'প্রিমিয়াম সুতি থ্রি-পিস, ঐতিহ্যবাহী কাতান শাড়ি, জর্জেট গাউন ও ট্রেন্ডি কুর্তির অনন্য সমাহার। সারাদেশে ক্যাশ অন ডেলিভারি ও দ্রুত হোম ডেলিভারি।',
    'hero.cta_shop': 'কালেকশন দেখুন',
    'hero.cta_track': 'অর্ডার ট্র্যাকিং',
    'hero.feature_delivery': 'সারাদেশে ক্যাশ অন ডেলিভারি',
    'hero.feature_quality': '১০০% অরিজিনাল কোয়ালিটি',
    'hero.feature_return': 'সহজ এক্সচেঞ্জ পলিসি',

    // Product Toolbar
    'toolbar.title': 'সকল পোশাক কালেকশন',
    'toolbar.total_items': 'টি পোশাক',
    'toolbar.showing': 'প্রদর্শিত হচ্ছে',
    'toolbar.sort_default': 'সাজান: ডিফল্ট',
    'toolbar.sort_price_low': 'মূল্য: কম থেকে বেশি',
    'toolbar.sort_price_high': 'মূল্য: বেশি থেকে কম',
    'toolbar.sort_newest': 'নতুন আগমন',
    'toolbar.sort_rating': 'সর্বোচ্চ রেটিং',
    'toolbar.filter_all': 'সকল',
    'toolbar.load_more': 'আরও পোশাক দেখুন',
    'toolbar.loading': 'লোড হচ্ছে...',
    'toolbar.all_loaded': 'সকল পোশাক প্রদর্শিত হয়েছে',

    // Product Card
    'card.off': 'ছাড়',
    'card.new': 'নতুন',
    'card.hot': 'হট',
    'card.out_of_stock': 'স্টক আউট',
    'card.in_stock': 'স্টকে আছে',
    'card.low_stock': 'Low Stock',
    'card.stock': 'স্টক',
    'card.items': 'টি',
    'card.view_details': 'বিস্তারিত দেখুন',
    'card.add_wishlist': 'পছন্দের তালিকায় যোগ করুন',
    'card.remove_wishlist': 'পছন্দের তালিকা থেকে সরান',
    'card.share': 'শেয়ার করুন',
    'card.link_copied': 'লিংক কপি করা হয়েছে! 📋',
    'card.wishlist_added': 'পছন্দের তালিকায় সেভ হয়েছে!',
    'card.wishlist_removed': 'তালিকা থেকে সরানো হয়েছে',

    // Product Detail Page
    'detail.order_now': 'সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)',
    'detail.add_to_cart': 'ব্যাগে যোগ করুন',
    'detail.added_to_cart': 'ব্যাগে যোগ করা হয়েছে!',
    'detail.buy_now': 'এখনই কিনুন',
    'detail.select_size': 'সাইজ নির্বাচন করুন:',
    'detail.select_color': 'রং নির্বাচন করুন:',
    'detail.fabric': 'ফেব্রিক / কাপড়:',
    'detail.sku': 'প্রোডাক্ট কোড:',
    'detail.free_size': 'ফ্রি সাইজ',
    'detail.cash_on_delivery_guarantee': 'পণ্য হাতে পেয়ে মূল্য পরিশোধ (Cash on Delivery)',
    'detail.nationwide_shipping': 'সারাদেশে দ্রুত হোম ডেলিভারি',
    'detail.check_before_pay': 'ডেলিভারিম্যানের সামনে দেখে নেওয়ার সুবিধা',
    'detail.related_products': 'এই ক্যাটাগরির আরও আকর্ষণীয় পোশাক',
    'detail.customer_reviews': 'গ্রাহকদের রিভিউ ও রেটিং',
    'detail.write_review': 'আপনার রিভিউ লিখুন',

    // Cart & Checkout
    'cart.title': 'আপনার শপিং ব্যাগ',
    'cart.empty_title': 'আপনার শপিং ব্যাগ খালি!',
    'cart.empty_subtitle': 'আপনার পছন্দের থ্রি-পিস, শাড়ি বা কুর্তি ব্যাগে যুক্ত করে শপিং শুরু করুন।',
    'cart.start_shopping': 'কেনাকাটা শুরু করুন',
    'cart.subtotal': 'সাবটোটাল:',
    'cart.delivery_fee': 'ডেলিভারি চার্জ:',
    'cart.free_delivery': 'ফ্রি ডেলিভারি',
    'cart.total': 'সর্বমোট মূল্য:',
    'cart.proceed_to_checkout': 'অর্ডার সম্পন্ন করুন',
    'cart.continue_shopping': 'আরও কেনাকাটা করুন',
    'cart.remove_item': 'আইটেম মুছে ফেলুন',
    'cart.clear_cart': 'ব্যাগ খালি করুন',

    // Checkout Modal
    'checkout.title': 'অর্ডার কনফার্মেশন ও ডেলিভারি তথ্য',
    'checkout.name_label': 'আপনার পুরো নাম',
    'checkout.name_placeholder': 'যেমন: সুমাইয়া আক্তার',
    'checkout.phone_label': 'মোবাইল নম্বর',
    'checkout.phone_placeholder': 'যেমন: 01712-345678',
    'checkout.address_label': 'ডেলিভারির পূর্ণ ঠিকানা',
    'checkout.address_placeholder': 'যেমন: হাউজ ১২, রোড ৫, সেক্টর ৩, উত্তরা, ঢাকা',
    'checkout.district_label': 'জেলা নির্বাচন করুন',
    'checkout.delivery_zone': 'ডেলিভারি এলাকা',
    'checkout.inside_dhaka': 'ঢাকার ভেতরে (৳৭০)',
    'checkout.outside_dhaka': 'ঢাকার বাইরে (৳১৩০)',
    'checkout.subtotal': 'পোশাকের মূল্য',
    'checkout.delivery_charge': 'ডেলিভারি চার্জ',
    'checkout.total_payable': 'মোট প্রদেয় বিল',
    'checkout.confirm_button': 'অর্ডারটি নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)',
    'checkout.processing': 'অর্ডার সাবমিট হচ্ছে...',
    'checkout.order_success_title': 'আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে',
    'checkout.order_success_msg': 'শীঘ্রই আমাদের প্রতিনিধি ফোন করে আপনার অর্ডারটি কনফার্ম করবেন।',
    'checkout.order_id': 'অর্ডার আইডি:',
    'checkout.track_order': 'অর্ডার ট্র্যাক করুন',
    'checkout.back_to_shop': 'পুনরায় শপিং-এ ফিরে যান',

    // Order Tracking
    'track.title': 'লাইভ অর্ডার ট্র্যাকিং',
    'track.subtitle': 'আপনার অর্ডার আইডি অথবা ফোন নম্বর দিয়ে বর্তমান অবস্থান ট্র্যাক করুন',
    'track.input_placeholder': 'অর্ডার আইডি (যেমন: NS-1024) বা মোবাইল নম্বর',
    'track.search_button': 'ট্র্যাক করুন',
    'track.status_pending': 'অপেক্ষমান (Pending)',
    'track.status_confirmed': 'কনফার্ম হয়েছে (Confirmed)',
    'track.status_shipped': 'কুরিয়ারে হস্তান্তর (Shipped)',
    'track.status_delivered': 'ডেলিভারি সম্পন্ন (Delivered)',
    'track.status_cancelled': 'বাতিল (Cancelled)',

    // Footer
    'footer.about_title': 'নারীর স্বপ্ন (Naarir Shopno)',
    'footer.about_desc': 'নারীর স্বপ্ন - বাংলাদেশের নারীদের বিশ্বস্ত ও এক্সক্লুসিভ ফ্যাশন ব্র্যান্ড। খাঁটি কাপড়, প্রিমিয়াম ফিনিশিং ও সুলভ মূল্যে সর্বোচ্চ সন্তুষ্টি আমাদের অঙ্গীকার।',
    'footer.quick_links': 'প্রয়োজনীয় লিংক',
    'footer.categories': 'জনপ্রিয় ক্যাটাগরি',
    'footer.customer_service': 'গ্রাহক সেবা ও যোগাযোগ',
    'footer.hotline': 'হটলাইন হেল্পলাইন',
    'footer.office': 'প্রধান কার্যালয়',
    'footer.rights': 'নারীর স্বপ্ন (Naarir Shopno). সর্বস্বত্ব সংরক্ষিত।',
    'footer.safe_shopping': '১০০% নিরাপদ কেনাকাটা ও ক্যাশ অন ডেলিভারি',

    // Common
    'common.currency': '৳',
    'common.items': 'টি',
    'common.close': 'বন্ধ করুন',
    'common.back': 'ফিরে যান',
    'common.save': 'সংরক্ষণ করুন',
    'common.edit': 'সম্পাদনা',
    'common.delete': 'মুছে ফেলুন',
    'common.confirm': 'নিশ্চিত করুন',
    'common.cancel': 'বাতিল',
    'common.success': 'সফল',
    'common.error': 'ত্রুটি',
  },
  en: {
    // Brand & Header
    'brand.name': 'Naarir Shopno',
    'brand.tagline': "Women's Fashion",
    'brand.slogan': 'Dress Your Dreams',
    'nav.home': 'Home',
    'nav.all_collections': 'All Collections',
    'nav.categories': 'Categories',
    'nav.profile': 'Profile',
    'nav.wishlist': 'Wishlist',
    'nav.admin': 'Admin',
    'nav.cart': 'Cart',
    'nav.track_order': 'Track Order',
    'nav.delivery_info': 'Delivery Info',
    'nav.search_placeholder': 'Search three-piece, saree, kurti, gown or products...',
    'nav.live': 'LIVE',
    'nav.clear_search': 'Clear',
    'nav.search_results': 'Search Results',
    'nav.popular_searches': 'Popular Searches',
    'nav.view_all_results': 'View All Results',
    'nav.no_search_results': 'No products found matching',
    'nav.language_switch': 'বাংলা',

    // Announcement
    'announcement.text': "🌸 Welcome to Naarir Shopno - Women's Fashion! Cash on delivery nationwide. Free delivery on any 3 dresses or orders over ৳3,000! 🌸",

    // Hero & Story
    'hero.badge': "Exclusive Women's Fashion 2026",
    'hero.headline': 'Blend of Heritage & Elegance for Your Dream Look',
    'hero.subheadline': 'Premium cotton three-pieces, traditional katan sarees, georgette gowns & trendy kurtis. Fast nationwide cash on delivery.',
    'hero.cta_shop': 'Explore Collections',
    'hero.cta_track': 'Track Order',
    'hero.feature_delivery': 'Nationwide Cash on Delivery',
    'hero.feature_quality': '100% Original Quality Guarantee',
    'hero.feature_return': 'Easy 7-Day Exchange Policy',

    // Product Toolbar
    'toolbar.title': 'All Dresses Collection',
    'toolbar.total_items': 'Dresses',
    'toolbar.showing': 'Showing',
    'toolbar.sort_default': 'Sort: Default',
    'toolbar.sort_price_low': 'Price: Low to High',
    'toolbar.sort_price_high': 'Price: High to Low',
    'toolbar.sort_newest': 'Newest Arrivals',
    'toolbar.sort_rating': 'Highest Rated',
    'toolbar.filter_all': 'All',
    'toolbar.load_more': 'Load More Dresses',
    'toolbar.loading': 'Loading...',
    'toolbar.all_loaded': 'All dresses displayed',

    // Product Card
    'card.off': 'OFF',
    'card.new': 'NEW',
    'card.hot': 'HOT',
    'card.out_of_stock': 'Out of Stock',
    'card.in_stock': 'In Stock',
    'card.low_stock': 'Low Stock',
    'card.stock': 'Stock',
    'card.items': 'items',
    'card.view_details': 'View Details',
    'card.add_wishlist': 'Add to Wishlist',
    'card.remove_wishlist': 'Remove from Wishlist',
    'card.share': 'Share',
    'card.link_copied': 'Link copied to clipboard! 📋',
    'card.wishlist_added': 'Saved to Wishlist!',
    'card.wishlist_removed': 'Removed from Wishlist',

    // Product Detail Page
    'detail.order_now': 'Order Now (Cash on Delivery)',
    'detail.add_to_cart': 'Add to Bag',
    'detail.added_to_cart': 'Added to Bag!',
    'detail.buy_now': 'Buy Now',
    'detail.select_size': 'Select Size:',
    'detail.select_color': 'Select Color:',
    'detail.fabric': 'Fabric / Material:',
    'detail.sku': 'Product Code:',
    'detail.free_size': 'Free Size',
    'detail.cash_on_delivery_guarantee': 'Pay on Delivery (Cash on Delivery)',
    'detail.nationwide_shipping': 'Fast Nationwide Home Delivery',
    'detail.check_before_pay': 'Check item in front of delivery agent',
    'detail.related_products': 'More Dresses from this Category',
    'detail.customer_reviews': 'Customer Reviews & Ratings',
    'detail.write_review': 'Write Your Review',

    // Cart & Checkout
    'cart.title': 'Your Shopping Bag',
    'cart.empty_title': 'Your shopping bag is empty!',
    'cart.empty_subtitle': 'Add your favorite three-pieces, sarees, or kurtis to start shopping.',
    'cart.start_shopping': 'Start Shopping',
    'cart.subtotal': 'Subtotal:',
    'cart.delivery_fee': 'Delivery Fee:',
    'cart.free_delivery': 'Free Delivery',
    'cart.total': 'Total Amount:',
    'cart.proceed_to_checkout': 'Proceed to Checkout',
    'cart.continue_shopping': 'Continue Shopping',
    'cart.remove_item': 'Remove Item',
    'cart.clear_cart': 'Clear Bag',

    // Checkout Modal
    'checkout.title': 'Order Confirmation & Delivery Details',
    'checkout.name_label': 'Full Name',
    'checkout.name_placeholder': 'e.g. Sumaiya Akter',
    'checkout.phone_label': 'Phone Number',
    'checkout.phone_placeholder': 'e.g. 01712-345678',
    'checkout.address_label': 'Full Delivery Address',
    'checkout.address_placeholder': 'e.g. House 12, Road 5, Sector 3, Uttara, Dhaka',
    'checkout.district_label': 'Select District',
    'checkout.delivery_zone': 'Delivery Zone',
    'checkout.inside_dhaka': 'Inside Dhaka (৳70)',
    'checkout.outside_dhaka': 'Outside Dhaka (৳130)',
    'checkout.subtotal': 'Dresses Subtotal',
    'checkout.delivery_charge': 'Delivery Charge',
    'checkout.total_payable': 'Total Payable Bill',
    'checkout.confirm_button': 'Confirm Order (Cash on Delivery)',
    'checkout.processing': 'Submitting order...',
    'checkout.order_success_title': 'Alhamdulillah! Your order has been placed',
    'checkout.order_success_msg': 'Our customer care representative will call you shortly to confirm your order.',
    'checkout.order_id': 'Order ID:',
    'checkout.track_order': 'Track Order',
    'checkout.back_to_shop': 'Back to Shopping',

    // Order Tracking
    'track.title': 'Live Order Tracking',
    'track.subtitle': 'Track current status using your Order ID or Phone Number',
    'track.input_placeholder': 'Order ID (e.g. NS-1024) or Phone Number',
    'track.search_button': 'Track Order',
    'track.status_pending': 'Pending',
    'track.status_confirmed': 'Confirmed',
    'track.status_shipped': 'Shipped to Courier',
    'track.status_delivered': 'Delivered',
    'track.status_cancelled': 'Cancelled',

    // Footer
    'footer.about_title': 'Naarir Shopno',
    'footer.about_desc': "Naarir Shopno is Bangladesh's trusted and exclusive women's fashion brand. Pure fabric, premium finishing, and best prices are our promise.",
    'footer.quick_links': 'Quick Links',
    'footer.categories': 'Popular Categories',
    'footer.customer_service': 'Customer Care & Contact',
    'footer.hotline': 'Hotline Helpline',
    'footer.office': 'Head Office',
    'footer.rights': 'Naarir Shopno. All rights reserved.',
    'footer.safe_shopping': '100% Safe Shopping & Cash on Delivery',

    // Common
    'common.currency': '৳',
    'common.items': 'items',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.success': 'Success',
    'common.error': 'Error',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ns_language');
      if (saved === 'en' || saved === 'bn') {
        return saved;
      }
    }
    return 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ns_language', lang);
      document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
    }
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.bn;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    if (translations.bn[key]) {
      return translations.bn[key];
    }
    return fallback || key;
  };

  const formatNumber = (num: number | string): string => {
    if (language === 'en') {
      return num.toString();
    }
    return num.toString().replace(/\d/g, (d) => BENGALI_NUMERALS[parseInt(d, 10)]);
  };

  const formatPrice = (amount: number): string => {
    const formatted = amount.toLocaleString();
    if (language === 'bn') {
      const bnNumber = formatted.replace(/\d/g, (d) => BENGALI_NUMERALS[parseInt(d, 10)]);
      return `৳${bnNumber}`;
    }
    return `৳${formatted}`;
  };

  const translateCategory = (nameOrId: string): string => {
    if (!nameOrId) return '';
    if (language === 'bn') return nameOrId;
    return CATEGORY_MAP[nameOrId] || CATEGORY_MAP[nameOrId.trim()] || nameOrId;
  };

  const translateProductName = (product: { name?: string; bengaliName?: string } | null | undefined): string => {
    if (!product) return '';
    if (language === 'en') {
      if (product.name && !/[\u0980-\u09FF]/.test(product.name)) {
        return product.name;
      }
      return product.name || product.bengaliName || '';
    }
    return product.bengaliName || product.name || '';
  };

  const translateColor = (color: string): string => {
    if (!color) return '';
    if (language === 'bn') return color;
    return COLOR_MAP[color.trim()] || color;
  };

  const translateSize = (size: string): string => {
    if (!size) return '';
    if (language === 'en') {
      if (size === 'ফ্রি সাইজ' || size === 'ফ্রি') return 'Free Size';
      if (size === 'ডিফল্ট') return 'Default';
      if (size === 'সেলাই ছাড়া') return 'Unstitched';
      return size;
    }
    return size;
  };

  const translateStatus = (status: string): string => {
    if (!status) return '';
    const item = STATUS_MAP[status.toLowerCase()];
    if (item) {
      return language === 'en' ? item.en : item.bn;
    }
    return status;
  };

  const translateDistrict = (districtName: string): string => {
    if (!districtName) return '';
    if (language === 'bn') return districtName;
    return DISTRICT_MAP[districtName.trim()] || districtName;
  };

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t,
    formatNumber,
    formatPrice,
    translateCategory,
    translateProductName,
    translateColor,
    translateSize,
    translateStatus,
    translateDistrict,
    isBangla: language === 'bn',
    isEnglish: language === 'en',
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
