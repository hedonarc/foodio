# Changelog

## 1.0.0 (2026-08-02)


### Features

* add project init ([b6dfd78](https://github.com/hedonarc/foodio/commit/b6dfd785ad75ac482fd469a5ceecffe16fe8d87b))
* add pull request template ([fabf2c3](https://github.com/hedonarc/foodio/commit/fabf2c3fae61cdbd2c7af59009dae41c729b73cf))
* add pull request template ([c5c71db](https://github.com/hedonarc/foodio/commit/c5c71db836c2ae0d14f6858d4c041bdb18ef951d))
* **api:** replace mock imports with a real HTTP data layer ([#9](https://github.com/hedonarc/foodio/issues/9)) ([8145d8d](https://github.com/hedonarc/foodio/commit/8145d8d67ec6519e7f239158ae9af929a230ebae))
* **cart:** a line is a dish plus an instruction, not a dish ([#49](https://github.com/hedonarc/foodio/issues/49)) ([87e1c08](https://github.com/hedonarc/foodio/commit/87e1c08792def22614f7ded51fd07f7d39e8cd92))
* **cart:** add the cart, the first half of the ordering spine ([#10](https://github.com/hedonarc/foodio/issues/10)) ([ae7b823](https://github.com/hedonarc/foodio/commit/ae7b8235831471cd615e87871603e10c45e8e002))
* **checkout:** an instruction survives to the placed order ([#52](https://github.com/hedonarc/foodio/issues/52)) ([f48079f](https://github.com/hedonarc/foodio/commit/f48079f54e4da2003b287a487a21803477f25a4b))
* **checkout:** close the ordering spine ([#16](https://github.com/hedonarc/foodio/issues/16)) ([caf15f7](https://github.com/hedonarc/foodio/commit/caf15f7b501653fc1d42d1ea9850dd8b91baf739))
* **discovery:** model Clips, replacing FeaturedVideo ([#30](https://github.com/hedonarc/foodio/issues/30)) ([abdc2d5](https://github.com/hedonarc/foodio/commit/abdc2d53965aff36bb6da3e864b420a8a48cb1df))
* **discovery:** the Clips tab — full-screen feed with the decided policy ([#39](https://github.com/hedonarc/foodio/issues/39)) ([23f3d5d](https://github.com/hedonarc/foodio/commit/23f3d5d5abd79020dc345973e9c10b512f0b206b))
* **discovery:** working search, and an orders screen ([#17](https://github.com/hedonarc/foodio/issues/17)) ([63bba43](https://github.com/hedonarc/foodio/commit/63bba4310f7824f0e26fe291c1eb038197fa2295))
* **identity:** people, sessions, and orders that belong to someone ([#64](https://github.com/hedonarc/foodio/issues/64)) ([a4b616d](https://github.com/hedonarc/foodio/commit/a4b616d7ebaba4fb944b14f9e7bb13d34a83c0be))
* **identity:** the chip reads as a control, not a portrait ([#67](https://github.com/hedonarc/foodio/issues/67)) ([d41df3d](https://github.com/hedonarc/foodio/commit/d41df3de1509e81c91350b497b74a16539ea53ef))
* **identity:** the identity chip — one control for who you are ([#65](https://github.com/hedonarc/foodio/issues/65)) ([2d9c4cc](https://github.com/hedonarc/foodio/commit/2d9c4cc1c706b48c1d4e415346b02c8ce1000061))
* implement persistent onboarding state management using SecureStore and hydration logic ([#6](https://github.com/hedonarc/foodio/issues/6)) ([3935412](https://github.com/hedonarc/foodio/commit/39354124f911be388f4d553ee78787484efdb815))
* implement restaurant home screen ([#7](https://github.com/hedonarc/foodio/issues/7)) ([9622fc9](https://github.com/hedonarc/foodio/commit/9622fc90eef5256ea6284b896869358d91d26847))
* implement restaurant menu feature ([#8](https://github.com/hedonarc/foodio/issues/8)) ([409dd37](https://github.com/hedonarc/foodio/commit/409dd374974f45c3f63841d0963f577cfa63f57f))
* **menu:** ours beside theirs, on the dish ([#51](https://github.com/hedonarc/foodio/issues/51)) ([d440202](https://github.com/hedonarc/foodio/commit/d440202080ed296c6d940b1a3edc7bf80321939c))
* **menu:** the dish page — quantity and a special instruction before adding ([#50](https://github.com/hedonarc/foodio/issues/50)) ([6a05616](https://github.com/hedonarc/foodio/commit/6a05616a5cfc7a18b78fe77867f5f7168ba685ba))
* **navigation:** tab bar — Home, Cart, Orders ([#38](https://github.com/hedonarc/foodio/issues/38)) ([1fa1320](https://github.com/hedonarc/foodio/commit/1fa132047bcc8208ab672a0d1a147ac7923550b2))
* **onboarding:** add permission screens  ([#2](https://github.com/hedonarc/foodio/issues/2)) ([2f06ecd](https://github.com/hedonarc/foodio/commit/2f06ecd33752ff3eb7bc3bb22011626932df6e14))
* **restaurants:** ours and theirs — clip shelves on the restaurant page ([#40](https://github.com/hedonarc/foodio/issues/40)) ([31cc04f](https://github.com/hedonarc/foodio/commit/31cc04fc307cdf12bcfb0187ab237a3f43a409ef))
* **work:** switching role changes the whole navigator ([#66](https://github.com/hedonarc/foodio/issues/66)) ([165d5cc](https://github.com/hedonarc/foodio/commit/165d5cc0db321e73ae392a66dd28f72dc6b629b6))


### Bug Fixes

* correct import paths in metro.config.js ([#5](https://github.com/hedonarc/foodio/issues/5)) ([7b2cf52](https://github.com/hedonarc/foodio/commit/7b2cf520936bf401fec6c7a456a8c9b3fadbc11e))
* **discovery:** scrim behind the clip overlay — white text vanished on pale footage ([#41](https://github.com/hedonarc/foodio/issues/41)) ([a7ef70c](https://github.com/hedonarc/foodio/commit/a7ef70cbeb58b1c3955bf310057d64f5d75bfecd))
* **ios:** give the location permission real usage copy ([#13](https://github.com/hedonarc/foodio/issues/13)) ([ddcd73c](https://github.com/hedonarc/foodio/commit/ddcd73c60a37847380b7f747e393fb7d75088b1d))
* **mocks:** failures wait as long as successes ([#62](https://github.com/hedonarc/foodio/issues/62)) ([835e4a2](https://github.com/hedonarc/foodio/commit/835e4a2911fca32e74c6159b1a461f16cbfdb5f0)), closes [#60](https://github.com/hedonarc/foodio/issues/60)
* **mocks:** replace two dead image URLs, and catch the next ones ([#29](https://github.com/hedonarc/foodio/issues/29)) ([175e0de](https://github.com/hedonarc/foodio/commit/175e0debf109127bd54f9d3dd0cb97206de34a6e))
* **navigation:** inset the clip viewer's controls, and stop double taps stacking screens ([#42](https://github.com/hedonarc/foodio/issues/42)) ([4d05feb](https://github.com/hedonarc/foodio/commit/4d05feb3510e099b5a1743271b113d2ad35a4e90))
* **onboarding:** Link text swallowed its own press; remove duplicate / route ([#14](https://github.com/hedonarc/foodio/issues/14)) ([c62d95b](https://github.com/hedonarc/foodio/commit/c62d95b2136f948a900f22e071ea0a19e92ae99e))
