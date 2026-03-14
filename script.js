// Global Configuration
const TOTAL_SEATS = 40;
const WHATSAPP_NUMBER = "8801335857956";

// Payment Method Selector
let currentPayNumber = "01308008954"; // default bkash

function changePayment(type) {
    const numberEl = document.getElementById('pay-number');
    const bkashBtn = document.getElementById('btn-bkash');
    const nagadBtn = document.getElementById('btn-nagad');

    // Clear active classes
    bkashBtn.classList.remove('active');
    nagadBtn.classList.remove('active');

    if (type === 'bkash') {
        bkashBtn.classList.add('active');
        currentPayNumber = "01308008954";
        numberEl.innerText = '+880 1308-008954';
    } else {
        nagadBtn.classList.add('active');
        currentPayNumber = "01308008954";
        numberEl.innerText = '+880 1308-008954';
    }
}

// Select Tier Logic
function selectTier(amount, element) {
    // Remove active class from all tiers
    document.querySelectorAll('.tier-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked tier
    element.classList.add('active');

    // Clear custom input when selecting a preset
    const customInput = document.getElementById('custom-amount');
    if (customInput) customInput.value = '';

    // Update display amount
    const displayEl = document.getElementById('display-amount');
    displayEl.innerHTML = `৳ ${amount}<small>BDT</small>`;

    // Add a quick pulse animation to the amount to draw attention
    displayEl.style.transform = 'scale(1.1)';
    setTimeout(() => {
        displayEl.style.transform = 'scale(1)';
    }, 200);
    displayEl.style.transition = 'transform 0.2s';
}

// Custom Amount Tier
function activateCustom(element) {
    document.querySelectorAll('.tier-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    const input = document.getElementById('custom-amount');
    input.focus();
    if (input.value) {
        updateCustomAmount(input);
    }
}

function updateCustomAmount(input) {
    const val = input.value;
    if (val && parseInt(val) > 0) {
        const displayEl = document.getElementById('display-amount');
        displayEl.innerHTML = `৳ ${val}<small>BDT</small>`;
        displayEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            displayEl.style.transform = 'scale(1)';
        }, 200);
        displayEl.style.transition = 'transform 0.2s';
    }
}

// Copy Number to Clipboard
function copyNumber() {
    navigator.clipboard.writeText(currentPayNumber).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Copied <i class="ph-fill ph-check"></i>';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Form Submission Simulation & LocalStorage


function convertBanglaDigit(number) {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return number.toString().replace(/\d/g, x => banglaDigits[x]);
}

function updateSeatAvailability() {
    let bookings = JSON.parse(localStorage.getItem('iftar_bookings')) || [];

    // Assuming we start with 0 base bookings
    let baseBookings = 7;
    let actualBooked = baseBookings + bookings.length;
    if (actualBooked > TOTAL_SEATS) actualBooked = TOTAL_SEATS;

    let remaining = TOTAL_SEATS - actualBooked;
    let percentage = (actualBooked / TOTAL_SEATS) * 100;

    const progressEl = document.getElementById('seat-progress');
    const bookedCountEl = document.getElementById('booked-count');
    const remainingInfoEl = document.getElementById('remaining-info');

    if (progressEl) progressEl.style.width = percentage + '%';
    if (bookedCountEl) bookedCountEl.innerText = convertBanglaDigit(actualBooked);
    if (remainingInfoEl) {
        if (actualBooked === 0) {
            remainingInfoEl.innerText = `৪০টি আসন খালি আছে — প্রথম সিটটি আপনি কনফার্ম করুন`;
        } else {
            remainingInfoEl.innerText = `মাত্র ${convertBanglaDigit(remaining)}টি আসন বাকি — দ্রুত আপনার সিটটি কনফার্ম করুন`;
        }
    }
}

// Ensure seats are calculated on load
document.addEventListener('DOMContentLoaded', updateSeatAvailability);

function submitForm() {
    const btn = document.querySelector('.booking-form button[type="submit"]');
    const originalText = btn.innerHTML;

    // Convert Bangla digits to English digits
    function banglaToEnglish(str) {
        const banglaMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
        return str.replace(/[০-৯]/g, d => banglaMap[d]);
    }

    // Get the selected amount
    const amountText = document.getElementById('display-amount').innerText;
    const cleanAmount = banglaToEnglish(amountText).replace(/[^0-9]/g, '');
    const amountNum = parseInt(cleanAmount) || 100;

    const newBooking = {
        name: document.getElementById('fname').value,
        phone: document.getElementById('fphone').value,
        email: document.getElementById('femail').value,
        link: document.getElementById('flink').value,
        trxId: document.getElementById('ftrx').value,
        amount: amountNum,
        date: new Date().toISOString()
    };

    btn.innerHTML = 'Submitting... <i class="ph ph-spinner-gap"></i>';
    btn.disabled = true;

    setTimeout(() => {
        // Save to browser LocalStorage
        let bookings = JSON.parse(localStorage.getItem('iftar_bookings')) || [];
        bookings.push(newBooking);
        localStorage.setItem('iftar_bookings', JSON.stringify(bookings));

        // Dynamically update UI
        updateSeatAvailability();

        btn.innerHTML = 'Success <i class="ph-fill ph-check-circle"></i>';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-primary');

        // Construct WhatsApp Message (Plain Text Version to avoid emoji breakage)
        const message = `*নতুন ইফতার রেজিস্ট্রেশন!*\n\n` +
            `> নাম: ${newBooking.name}\n` +
            `> ফোন: ${newBooking.phone}\n` +
            `> ইমেইল: ${newBooking.email}\n` +
            `> প্রোফাইল: ${newBooking.link}\n` +
            `> পরিমাণ: ৳ ${newBooking.amount}\n` +
            `> TrxID: ${newBooking.trxId}\n\n` +
            `_Dev Iftar 2026_`;

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        // Open WhatsApp slightly faster
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            const form = document.querySelector('.booking-form');
            form.reset();
            btn.innerHTML = originalText;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-primary');
            btn.disabled = false;
        }, 800);
    }, 1000);
}

// Smooth scrolling for Anchor tags
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') === '#') return;
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
