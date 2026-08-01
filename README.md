# OpenLearn

OpenLearn, tamamı statik çalışan ve kurs içeriğini GitHub reposunda saklayan minimal bir kurs platformudur. Kullanıcılar kursları hesap açmadan arayabilir ve okuyabilir; içerik üreticileri GitHub hesabı ile bağlanıp JSON dosyasını repo üzerinden günceller.

## Editör Kuralları

- GitHub ile giriş yapan bir kullanıcı en fazla 5 kurs oluşturabilir.
- Bir kurs en fazla 50 ders içerebilir.
- Kullanıcı sadece kendi kurslarını düzenleyebilir veya silebilir.
- Kurs önizlemesi banner URL, logo URL ve kurs adı ile oluşturulur.
- Ders içeriği Markdown destekler: başlıklar, listeler, linkler, görseller, kalın metin ve inline kod.
- Medya dosyaları depoya yüklenmez; video, resim, ses, link ve HTML iframe embed alanları harici URL ile tutulur.

## Çalıştırma

Bu proje build gerektirmez. `index.html` dosyasını tarayıcıda açmak yeterlidir.

Yerel HTTP sunucu isterseniz:

```bash
python3 -m http.server 5173
```

## GitHub Depolama Modeli

Varsayılan dosya yolu:

```text
courses.json
```

Beklenen format:

```json
{
  "courses": [
    {
      "id": "ornek-kurs",
      "title": "Örnek Kurs",
      "description": "Kısa açıklama",
      "bannerUrl": "https://example.com/banner.jpg",
      "logoUrl": "https://example.com/logo.png",
      "level": "Başlangıç",
      "owner": "github-kullanici",
      "updatedAt": "2026-08-01",
      "lessons": [
        {
          "title": "Ders 1: Giriş",
          "mediaType": "video",
          "mediaUrl": "https://www.youtube.com/embed/...",
          "embedHtml": "",
          "body": "## Ders metni\n\n- Markdown destekli içerik\n- ![Görsel](https://example.com/image.jpg)",
          "quiz": {
            "question": "Soru?",
            "options": ["A", "B", "C"],
            "answer": 0
          }
        }
      ]
    }
  ]
}
```

Video, ses ve materyal dosyaları GitHub'a yüklenmez; yalnızca harici URL olarak bağlanır.

`mediaType` değerleri: `none`, `video`, `image`, `audio`, `embed`, `url`.

`embed` için `embedHtml` alanına HTTPS kaynaklı iframe HTML ekleyin.

## Sıfır Sunucu GitHub Girişi

OAuth için GitHub Device Flow desteklenir. GitHub'da bir OAuth App oluşturup Device Flow'u etkinleştirin, ardından uygulamada Client ID girin.

Alternatif olarak fine-grained personal access token kullanılabilir. Token için ilgili repoda Contents okuma/yazma izni gerekir.
