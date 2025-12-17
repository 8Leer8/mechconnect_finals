from rest_framework import serializers
from .models import BookingPayment, Transaction
from bookings.models import Booking


class BookingPaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(write_only=True)
    paid_by_id = serializers.IntegerField(write_only=True, required=False)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    
    class Meta:
        model = BookingPayment
        fields = [
            'payment_id', 'booking', 'booking_id', 'payment_type', 'payment_status',
            'payment_method', 'total_amount', 'amount_paid', 'remaining_balance',
            'payment_proof', 'reference_number', 'paid_by', 'paid_by_id', 'payment_date',
            'notes', 'created_at', 'updated_at', 'payment_status_display',
            'payment_method_display', 'payment_type_display'
        ]
        read_only_fields = ['payment_id', 'booking', 'paid_by', 'payment_status', 'remaining_balance', 'created_at', 'updated_at']

    def create(self, validated_data):
        booking_id = validated_data.pop('booking_id')
        paid_by_id = validated_data.pop('paid_by_id', None)
        
        try:
            booking = Booking.objects.get(booking_id=booking_id)
        except Booking.DoesNotExist:
            raise serializers.ValidationError({'booking_id': 'Booking not found'})
        
        # Set total_amount from booking if not provided
        if 'total_amount' not in validated_data:
            validated_data['total_amount'] = booking.amount_fee
        
        # Set paid_by from paid_by_id if provided
        if paid_by_id:
            from accounts.models import Account
            try:
                paid_by = Account.objects.get(acc_id=paid_by_id)
                validated_data['paid_by'] = paid_by
            except Account.DoesNotExist:
                pass
        
        validated_data['booking'] = booking
        
        return super().create(validated_data)


class BookingPaymentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with booking information"""
    booking_details = serializers.SerializerMethodField()
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    
    class Meta:
        model = BookingPayment
        fields = '__all__'
        
    def get_booking_details(self, obj):
        return {
            'booking_id': obj.booking.booking_id,
            'status': obj.booking.status,
            'booked_at': obj.booking.booked_at,
        }


class TransactionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['transaction_id', 'commission_amount', 'provider_payout', 'transaction_date', 'updated_at']
