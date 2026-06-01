package com.example.fitapp

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.RatingBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class ReviewActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_review)

        val ratingBar = findViewById<RatingBar>(R.id.ratingBar)
        val btnSendReview = findViewById<Button>(R.id.btnSendReview)

        btnSendReview.setOnClickListener {
            val note = ratingBar.rating

            Toast.makeText(
                this,
                "Avis enregistré localement : $note/5",
                Toast.LENGTH_SHORT
            ).show()

            startActivity(Intent(this, HomeActivity::class.java))
            finish()
        }
    }
}