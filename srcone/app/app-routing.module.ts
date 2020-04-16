import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'about-us', loadChildren: './about-us/about-us.module#AboutUsPageModule' },
  { path: 'cart', loadChildren: './cart/cart.module#CartPageModule' },
  { path: 'contact-us', loadChildren: './contact-us/contact-us.module#ContactUsPageModule' },
  { path: 'my-account', loadChildren: './my-account/my-account.module#MyAccountPageModule' },
  { path: 'my-orders', loadChildren: './my-orders/my-orders.module#MyOrdersPageModule' },
  { path: 'order', loadChildren: './order/order.module#OrderPageModule' },
  { path: 'product-detail/:id', loadChildren: './product-detail/product-detail.module#ProductDetailPageModule' },
  { path: 'products/:id/:name/:type', loadChildren: './products/products.module#ProductsPageModule' },
  { path: 'campaign/:slug', loadChildren: './campaigns/campaigns.module#CampaignsPageModule' },
  { path: 'search', loadChildren: './search/search.module#SearchPageModule' },
  { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
  { path: 'shipping-method', loadChildren: './shipping-method/shipping-method.module#ShippingMethodPageModule' },

  { path: 'thank-you', loadChildren: './thank-you/thank-you.module#ThankYouPageModule' },
  { path: 'wish-list', loadChildren: './wish-list/wish-list.module#WishListPageModule' },
  { path: 'addresses', loadChildren: './address-pages/addresses/addresses.module#AddressesPageModule' },

  { path: 'shipping-address', loadChildren: './address-pages/shipping-address/shipping-address.module#ShippingAddressPageModule' },
  { path: 'home3', loadChildren: './home-pages/home3/home3.module#Home3PageModule' },
  { path: 'my-order-detail', loadChildren: './my-order-detail/my-order-detail.module#MyOrderDetailPageModule' },
  { path: 'verify-login', loadChildren: './modals/verify-login/verify-login.module#VerifyLoginPageModule' },
  { path: 'delivery-hours', loadChildren: './delivery-hours/delivery-hours.module#DeliveryHoursPageModule' },
  { path: 'otp-page', loadChildren: './modals/otp-page/otp-page.module#OtpPagePageModule' },
  { path: 'campaignes', loadChildren: './campaignes/campaignes.module#CampaignesPageModule' },
  { path: 'courier', loadChildren: './courier/courier.module#CourierPageModule' },
  { path: 'choosebag', loadChildren: './choosebag/choosebag.module#ChoosebagPageModule' },
  { path: 'billing-address', loadChildren: './address-pages/billing-address/billing-address.module#BillingAddressPageModule' },
  { path: 'mesafeli-satis-sozlesmesi', loadChildren: './modals/mesafeli-satis-sozlesmesi/mesafeli-satis-sozlesmesi.module#MesafeliSatisSozlesmesiPageModule' },
  { path: 'bilgilendirme-formu', loadChildren: './modals/bilgilendirme-formu/bilgilendirme-formu.module#BilgilendirmeFormuPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
