# Cấu trúc code front-end
src/
├── app
│   ├── dashboard
│   │   └── page.tsx
│   ├── login
│   │   └── page.tsx
│   ├── register
│   │   └── page.tsx
│   ├── verify-email
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── home-screen.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components
│   ├── base
│   │   ├── avatar
│   │   │   ├── base-components
│   │   │   │   ├── avatar-add-button.tsx
│   │   │   │   ├── avatar-company-icon.tsx
│   │   │   │   ├── avatar-count.tsx
│   │   │   │   ├── avatar-online-indicator.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── verified-tick.tsx
│   │   │   ├── avatar-label-group.tsx
│   │   │   ├── avatar-profile-photo.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── utils.ts
│   │   ├── badges
│   │   │   ├── badge-groups.tsx
│   │   │   ├── badge-types.ts
│   │   │   └── badges.tsx
│   │   ├── button-group
│   │   │   └── button-group.tsx
│   │   ├── buttons
│   │   │   ├── app-store-buttons-outline.tsx
│   │   │   ├── app-store-buttons.tsx
│   │   │   ├── button-utility.tsx
│   │   │   ├── button.tsx
│   │   │   ├── close-button.tsx
│   │   │   ├── social-button.tsx
│   │   │   └── social-logos.tsx
│   │   ├── checkbox
│   │   │   └── checkbox.tsx
│   │   ├── dropdown
│   │   │   ├── dropdown-account-breadcrumb.tsx
│   │   │   ├── dropdown-account-button.tsx
│   │   │   ├── dropdown-account-card-md.tsx
│   │   │   ├── dropdown-account-card-sm.tsx
│   │   │   ├── dropdown-account-card-xs.tsx
│   │   │   ├── dropdown-avatar.tsx
│   │   │   ├── dropdown-button-advanced.tsx
│   │   │   ├── dropdown-button-link.tsx
│   │   │   ├── dropdown-button-simple.tsx
│   │   │   ├── dropdown-icon-advanced.tsx
│   │   │   ├── dropdown-icon-simple.tsx
│   │   │   ├── dropdown-integration.tsx
│   │   │   ├── dropdown-search-advanced.tsx
│   │   │   ├── dropdown-search-simple.tsx
│   │   │   └── dropdown.tsx
│   │   ├── file-upload-trigger
│   │   │   └── file-upload-trigger.tsx
│   │   ├── form
│   │   │   └── form.tsx
│   │   ├── input
│   │   │   ├── hint-text.tsx
│   │   │   ├── input-date.tsx
│   │   │   ├── input-file.tsx
│   │   │   ├── input-group.tsx
│   │   │   ├── input-number.tsx
│   │   │   ├── input-payment.tsx
│   │   │   ├── input-tags-outer.tsx
│   │   │   ├── input-tags.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── pin-input.tsx
│   │   ├── progress-indicators
│   │   │   ├── progress-circles.tsx
│   │   │   ├── progress-indicators.tsx
│   │   │   └── simple-circle.tsx
│   │   ├── radio-buttons
│   │   │   └── radio-buttons.tsx
│   │   ├── select
│   │   │   ├── combobox.tsx
│   │   │   ├── multi-select.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select-item.tsx
│   │   │   ├── select-native.tsx
│   │   │   ├── select-shared.tsx
│   │   │   ├── select.tsx
│   │   │   └── tag-select.tsx
│   │   ├── slider
│   │   │   └── slider.tsx
│   │   ├── tags
│   │   │   ├── base-components
│   │   │   │   ├── tag-checkbox.tsx
│   │   │   │   └── tag-close-x.tsx
│   │   │   └── tags.tsx
│   │   ├── textarea
│   │   │   └── textarea.tsx
│   │   ├── toggle
│   │   │   └── toggle.tsx
│   │   └── tooltip
│   │       └── tooltip.tsx
│   └── features
│       └── auth
│           ├── LoginForm.tsx
│           └── RegisterForm.tsx
├── context
│   └── ToastContext.tsx
├── hooks
│   ├── use-breakpoint.ts
│   ├── use-clipboard.ts
│   └── use-resize-observer.ts
├── lib
│   └── axios.ts
├── providers
│   ├── router-provider.tsx
│   └── theme.tsx
├── schemas
│   └── auth.schema.ts
├── services
│   └── auth.service.ts
├── styles
│   ├── globals.css
│   ├── theme.css
│   └── typography.css
└── utils
    ├── countries.tsx
    ├── cx.ts
    ├── is-react-component.ts
    └── timezones.tsx