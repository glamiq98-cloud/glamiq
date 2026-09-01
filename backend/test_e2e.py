"""
End-to-end functional test script for Glam IQ API.
Verifies the complete user journey and admin workflows.
"""

import asyncio
import io
from httpx import AsyncClient, ASGITransport
from app.main import app


async def test_full_pipeline():
    print("\n========================================================")
    print("      STARTING GLAM IQ END-TO-END VERIFICATION")
    print("========================================================")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/")
        assert res.status_code == 200
        print("[PASS] 1. Health check: 200 OK")

        # 2. Register user
        email = f"test_stylist_{asyncio.get_event_loop().time()}@example.com"
        reg_payload = {
            "full_name": "Eleanor Vance",
            "email": email,
            "password": "Password123!",
            "gender": "female",
        }
        res = await client.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 201, f"Register failed: {res.text}"
        print(f"[PASS] 2. User registered: {email}")

        # 3. Login user
        login_res = await client.post("/api/auth/login", json={"email": email, "password": "Password123!"})
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        access_token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        print("[PASS] 3. Login authenticated & JWT access token received")

        # 4. Update profile & preferences
        prof_res = await client.put(
            "/api/profile",
            json={
                "full_name": "Eleanor Vance",
                "gender": "female",
                "preferences": {
                    "metal_preference": "gold",
                    "style_preference": "modern",
                    "favorite_colors": "Royal Blue, Emerald",
                },
            },
            headers=headers,
        )
        assert prof_res.status_code == 200
        print("[PASS] 4. Profile preferences saved")

        # 5. List occasions
        occ_res = await client.get("/api/occasions")
        assert occ_res.status_code == 200
        occasions = occ_res.json()
        assert len(occasions) > 0
        formal_occ = next((o for o in occasions if "Formal" in o["occasion_name"] or "Wedding" in o["occasion_name"]), occasions[0])
        print(f"[PASS] 5. Occasions fetched ({len(occasions)} items)")

        # 6. Upload an outfit
        dummy_img = io.BytesIO(b"fake_jpeg_image_content_for_testing_purposes")
        upload_res = await client.post(
            "/api/outfits",
            files={"file": ("outfit.jpg", dummy_img, "image/jpeg")},
            data={
                "occasion_id": formal_occ["occasion_id"],
                "color_palette": "Crimson Red, Gold",
                "style_type": "formal",
            },
            headers=headers,
        )
        assert upload_res.status_code == 201, f"Outfit upload failed: {upload_res.text}"
        outfit_data = upload_res.json()
        outfit_id = outfit_data["outfit_id"]
        print(f"[PASS] 6. Outfit uploaded (ID #{outfit_id}): {outfit_data['color_palette']}")

        # 7. Run Recommendation Engine
        rec_res = await client.get(f"/api/style-suggestions/{outfit_id}", headers=headers)
        assert rec_res.status_code == 200, f"Rec failed: {rec_res.text}"
        rec = rec_res.json()
        assert rec["jewelry_suggestion"]
        assert rec["makeup_suggestion"]
        assert rec["explanation"]
        print(f"[PASS] 7. Style Suggestions Generated:")
        print(f"       • Harmony: {rec['color_harmony']}")
        print(f"       • Jewelry: {rec['jewelry_suggestion']}")
        print(f"       • Makeup:  {rec['makeup_suggestion']}")
        print(f"       • Reason:  {rec['explanation'][:100]}...")

        # 8. Query AI Stylist Chatbot
        chat_res = await client.post(
            "/api/chatbot/query",
            json={"message": "Should I wear gold or silver jewelry with my crimson red formal look?"},
            headers=headers,
        )
        assert chat_res.status_code == 200
        bot_reply = chat_res.json()["bot_response"]
        assert len(bot_reply) > 10
        print(f"[PASS] 8. Virtual Stylist replied: \"{bot_reply[:90]}...\"")

        # 9. Admin Login & Dashboard Logs
        admin_login_res = await client.post(
            "/api/admin/auth/login",
            json={"username_or_email": "admin", "password": "admin12345"},
        )
        assert admin_login_res.status_code == 200
        print("[PASS] 9. Admin authenticated successfully")

        admin_logs_res = await client.get("/api/admin/logs")
        assert admin_logs_res.status_code == 200
        stats = admin_logs_res.json()
        print(f"[PASS] 10. Admin metrics: {stats['total_users']} users, {stats['total_outfits']} outfits, {stats['total_recommendations']} recs, {stats['total_fashion_items']} products")

    print("\n========================================================")
    print("      ALL 10 END-TO-END PIPELINE CHECKS PASSED 100%!")
    print("========================================================\n")


if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
